import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

// Função para verificar se o arquivo é áudio
function isAudioFile(filename: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.webm'];
  const ext = filename.toLowerCase().split('.').pop();
  return audioExtensions.includes(`.${ext}`);
}

// Função para processar áudio diretamente (sem conversão)
async function processAudioDirectly(inputPath: string): Promise<string> {
  console.log("🎵 Processando arquivo de áudio diretamente");
  return await fileToBase64(inputPath);
}

// Função para converter arquivo para base64
async function fileToBase64(filePath: string): Promise<string> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

export async function POST(req: NextRequest) {
  let tempInputPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ message: "Nenhum arquivo enviado." }, { status: 400 });
    }

    // Verificar tamanho do arquivo (limite para Vercel: ~50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        message: "Arquivo muito grande. Tamanho máximo: 50MB." 
      }, { status: 400 });
    }

    // Verificar se é arquivo de áudio
    if (!isAudioFile(file.name)) {
      return NextResponse.json({ 
        message: "Formato não suportado. Envie um arquivo de áudio (.mp3, .wav, .flac, .aac, .ogg, .m4a, .webm)." 
      }, { status: 400 });
    }

    // Gerar nome único para arquivo temporário
    const sessionId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    const inputExtension = file.name.split('.').pop() || 'tmp';
    
    tempInputPath = join(tmpdir(), `input_${sessionId}.${inputExtension}`);

    // Salvar arquivo enviado temporariamente
    const bytes = await file.arrayBuffer();
    await writeFile(tempInputPath, new Uint8Array(bytes));

    console.log(`🎬 Processando arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Processar arquivo de áudio diretamente
    console.log("🎵 Processando arquivo de áudio diretamente");
    const audioBase64 = await processAudioDirectly(tempInputPath);

    // Chamar a API de transcrição interna
    const transcriptionResponse = await fetch(`${req.nextUrl.origin}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64 }),
    });

    if (!transcriptionResponse.ok) {
      const error = await transcriptionResponse.json();
      throw new Error(error.message || 'Erro na transcrição');
    }

    const { transcription } = await transcriptionResponse.json();

    return NextResponse.json({ 
      transcription,
      originalFile: file.name,
      processedFormat: 'Áudio Original (sem conversão)',
      sessionId 
    });

  } catch (error: unknown) {
    console.error("Erro no processamento:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ 
      message: "Erro ao processar o arquivo.", 
      error: errorMessage 
    }, { status: 500 });
  } finally {
    // Limpar arquivo temporário
    if (tempInputPath) {
      try { await unlink(tempInputPath); } catch {}
    }
  }
} 