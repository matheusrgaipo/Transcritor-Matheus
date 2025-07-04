import { NextRequest, NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import { Storage } from "@google-cloud/storage";

const speechClient = new SpeechClient();
const storage = new Storage();

const BUCKET_NAME = process.env.GOOGLE_CLOUD_BUCKET_NAME_STORAGE;

async function uploadAudioToGCS(audioBase64: string, filename: string): Promise<string> {
  if (!BUCKET_NAME) throw new Error("Bucket name não configurado.");
  const buffer = Buffer.from(audioBase64, "base64");
  const file = storage.bucket(BUCKET_NAME).file(filename);
  await file.save(buffer, { contentType: "audio/flac" });
  return `gs://${BUCKET_NAME}/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const { audioBase64 } = await req.json();
    if (!audioBase64)
      return NextResponse.json({ message: "Nenhum dado de áudio foi fornecido." }, { status: 400 });

    const filename = `upload-${Date.now()}.flac`;
    const gcsUri = await uploadAudioToGCS(audioBase64, filename);

    // Usar longRunningRecognize da API v1 (funciona com o SDK atual)
    const [operation] = await speechClient.longRunningRecognize({
      audio: { uri: gcsUri },
      config: {
        encoding: "FLAC",
        sampleRateHertz: 16000,
        languageCode: "pt-BR",
        model: "latest_long", // modelo otimizado para áudios longos
        enableAutomaticPunctuation: true, // Habilita pontuação automática
      },
    });

    // Aguardar a conclusão da operação
    const [response] = await operation.promise();

    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .join("\n");

    // Limpeza opcional do arquivo
    await storage.bucket(BUCKET_NAME).file(filename).delete().catch(() => {});

    return NextResponse.json({ transcription });
  } catch (error: any) {
    console.error("Erro na transcrição:", error);
    return NextResponse.json({ message: "Erro ao processar o áudio.", error: error.message }, { status: 500 });
  }
} 