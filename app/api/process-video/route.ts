import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

// Configurar o caminho do FFmpeg para usar o binário instalado
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Função para processar áudio diretamente (fallback sem FFmpeg)
async function processAudioDirectly(inputPath: string): Promise<string> {
  console.log("🔄 Processando áudio diretamente (sem conversão)");
  return await fileToBase64(inputPath);
}

// Função para verificar se o arquivo é áudio
function isAudioFile(filename: string): boolean {
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
  const ext = filename.toLowerCase().split('.').pop();
  return audioExtensions.includes(`.${ext}`);
}

// Função para converter arquivo para FLAC otimizado para transcrição
async function convertToFlac(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec('flac')
      .audioChannels(1) // Mono para melhor reconhecimento
      .audioFrequency(16000) // Taxa de amostragem de 16kHz
      .audioBitrate('192k') // Alta qualidade para FLAC
      .outputOptions([
        '-ar 16000', // Taxa de amostragem fixa em 16kHz
        '-ac 1', // Canal mono
        '-sample_fmt s16', // Formato de amostra LINEAR16
        '-compression_level 0' // Máxima qualidade de compressão FLAC
      ])
      .on('start', (commandLine) => {
        console.log('🔄 Comando FFmpeg:', commandLine);
      })
      .on('progress', (progress) => {
        console.log(`⏳ Progresso: ${Math.round(progress.percent || 0)}%`);
      })
      .on('end', () => {
        console.log(`✅ Conversão concluída: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('❌ Erro na conversão:', err);
        reject(err);
      })
      .run();
  });
}

// Função para converter arquivo para base64
async function fileToBase64(filePath: string): Promise<string> {
  const fs = await import('fs/promises');
  const buffer = await fs.readFile(filePath);
  return buffer.toString('base64');
}

export async function POST(req: NextRequest) {
  let tempInputPath: string | null = null;
  let tempOutputPath: string | null = null;

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

    // Gerar nomes únicos para arquivos temporários
    const sessionId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    const inputExtension = file.name.split('.').pop() || 'tmp';
    
    tempInputPath = join(tmpdir(), `input_${sessionId}.${inputExtension}`);
    tempOutputPath = join(tmpdir(), `output_${sessionId}.flac`);

    // Salvar arquivo enviado temporariamente
    const bytes = await file.arrayBuffer();
    await writeFile(tempInputPath, new Uint8Array(bytes));

    console.log(`🎬 Processando arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Verificar se FFmpeg está disponível
    let useFFmpeg = true;
    try {
      console.log(`🔧 FFmpeg path: ${ffmpegInstaller.path}`);
    } catch (error) {
      console.error("❌ FFmpeg não disponível:", error);
      useFFmpeg = false;
    }

    let audioBase64: string;

    // Se é arquivo de áudio e FFmpeg não está disponível, processar diretamente
    if (!useFFmpeg && isAudioFile(file.name)) {
      console.log("🎵 Processando arquivo de áudio diretamente");
      audioBase64 = await processAudioDirectly(tempInputPath);
    } else if (!useFFmpeg) {
      return NextResponse.json({ 
        message: "FFmpeg não disponível. Envie um arquivo de áudio (.mp3, .wav, .flac, etc.) para processamento direto." 
      }, { status: 500 });
    } else {
      // Converter para FLAC otimizado usando FFmpeg
      console.log("🔄 Convertendo com FFmpeg");
      await convertToFlac(tempInputPath, tempOutputPath);
      audioBase64 = await fileToBase64(tempOutputPath);
    }

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
      processedFormat: 'FLAC (16kHz, Mono)',
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
    // Limpar arquivos temporários
    if (tempInputPath) {
      try { await unlink(tempInputPath); } catch {}
    }
    if (tempOutputPath) {
      try { await unlink(tempOutputPath); } catch {}
    }
  }
} 