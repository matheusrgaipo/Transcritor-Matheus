import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

// Função para verificar se o arquivo é áudio e retornar informações
function getAudioInfo(filename: string): { isAudio: boolean; extension: string; encoding?: string; sampleRate?: number } {
  console.log("🔍 [LOG] Verificando se arquivo é áudio:", filename);
  const audioExtensions = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.webm'];
  const ext = filename.toLowerCase().split('.').pop() || '';
  const isAudio = audioExtensions.includes(`.${ext}`);
  
  // Mapear extensões para configurações do Google Speech API
  const audioConfig: Record<string, { encoding: string; sampleRate: number }> = {
    'mp3': { encoding: 'MP3', sampleRate: 16000 },
    'wav': { encoding: 'LINEAR16', sampleRate: 16000 },
    'flac': { encoding: 'FLAC', sampleRate: 16000 },
    'aac': { encoding: 'AAC', sampleRate: 16000 },
    'ogg': { encoding: 'OGG_OPUS', sampleRate: 16000 },
    'm4a': { encoding: 'MP4', sampleRate: 16000 },
    'webm': { encoding: 'WEBM_OPUS', sampleRate: 48000 }
  };
  
  const config = audioConfig[ext] || { encoding: 'LINEAR16', sampleRate: 16000 };
  
  console.log("🔍 [LOG] Extensão encontrada:", ext, "| É áudio:", isAudio);
  console.log("🔍 [LOG] Configuração detectada:", config);
  
  return {
    isAudio,
    extension: ext,
    encoding: config.encoding,
    sampleRate: config.sampleRate
  };
}

// Função para processar áudio diretamente (sem conversão)
async function processAudioDirectly(inputPath: string): Promise<string> {
  console.log("🎵 [LOG] Iniciando processamento direto do áudio");
  console.log("📁 [LOG] Caminho do arquivo:", inputPath);
  
  try {
    const result = await fileToBase64(inputPath);
    console.log("✅ [LOG] Conversão para base64 concluída. Tamanho:", result.length, "caracteres");
    return result;
  } catch (error) {
    console.error("❌ [LOG] Erro na conversão para base64:", error);
    throw error;
  }
}

// Função para converter arquivo para base64
async function fileToBase64(filePath: string): Promise<string> {
  console.log("🔄 [LOG] Convertendo arquivo para base64:", filePath);
  
  try {
    console.log("✅ [LOG] Usando readFile importado estaticamente");
    
    const buffer = await readFile(filePath);
    console.log("✅ [LOG] Arquivo lido com sucesso. Tamanho do buffer:", buffer.length, "bytes");
    
    const base64 = buffer.toString('base64');
    console.log("✅ [LOG] Conversão para base64 concluída");
    
    return base64;
  } catch (error) {
    console.error("❌ [LOG] Erro na função fileToBase64:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  console.log("🚀 [LOG] === INICIANDO PROCESSAMENTO DE VÍDEO/ÁUDIO ===");
  console.log("📅 [LOG] Timestamp:", new Date().toISOString());
  
  let tempInputPath: string | null = null;

  try {
    console.log("📥 [LOG] Recebendo dados do formulário...");
    const formData = await req.formData();
    console.log("✅ [LOG] FormData recebido com sucesso");
    
    const file = formData.get('file') as File;
    console.log("📄 [LOG] Arquivo extraído:", file ? `${file.name} (${file.size} bytes)` : 'null');
    
    if (!file) {
      console.log("❌ [LOG] Nenhum arquivo enviado");
      return NextResponse.json({ message: "Nenhum arquivo enviado." }, { status: 400 });
    }

    console.log("🔍 [LOG] Verificando tamanho do arquivo...");
    // Verificar tamanho do arquivo (limite para Vercel: ~50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      console.log("❌ [LOG] Arquivo muito grande:", file.size, "bytes (máximo:", maxSize, "bytes)");
      return NextResponse.json({ 
        message: "Arquivo muito grande. Tamanho máximo: 50MB." 
      }, { status: 400 });
    }
    console.log("✅ [LOG] Tamanho do arquivo OK:", file.size, "bytes");

    console.log("🔍 [LOG] Verificando formato do arquivo...");
    // Verificar se é arquivo de áudio e obter configurações
    const audioInfo = getAudioInfo(file.name);
    if (!audioInfo.isAudio) {
      console.log("❌ [LOG] Formato não suportado:", file.name);
      return NextResponse.json({ 
        message: "Formato não suportado. Envie um arquivo de áudio (.mp3, .wav, .flac, .aac, .ogg, .m4a, .webm)." 
      }, { status: 400 });
    }
    console.log("✅ [LOG] Formato de arquivo válido:", audioInfo);

    console.log("🔧 [LOG] Gerando nome único para arquivo temporário...");
    // Gerar nome único para arquivo temporário
    const sessionId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
    const inputExtension = file.name.split('.').pop() || 'tmp';
    
    tempInputPath = join(tmpdir(), `input_${sessionId}.${inputExtension}`);
    console.log("📁 [LOG] Caminho temporário gerado:", tempInputPath);

    console.log("💾 [LOG] Salvando arquivo temporariamente...");
    // Salvar arquivo enviado temporariamente
    const bytes = await file.arrayBuffer();
    console.log("✅ [LOG] ArrayBuffer obtido. Tamanho:", bytes.byteLength, "bytes");
    
    await writeFile(tempInputPath, new Uint8Array(bytes));
    console.log("✅ [LOG] Arquivo salvo temporariamente em:", tempInputPath);

    console.log(`🎬 [LOG] Processando arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    console.log("🔄 [LOG] Iniciando processamento de áudio...");
    // Processar arquivo de áudio diretamente
    console.log("🎵 [LOG] Processando arquivo de áudio diretamente");
    const audioBase64 = await processAudioDirectly(tempInputPath);
    console.log("✅ [LOG] Processamento de áudio concluído. Tamanho base64:", audioBase64.length);

    console.log("🌐 [LOG] Chamando API de transcrição interna...");
    // Chamar a API de transcrição interna
    const transcriptionUrl = `${req.nextUrl.origin}/api/transcribe`;
    console.log("🔗 [LOG] URL da transcrição:", transcriptionUrl);
    
    const transcriptionResponse = await fetch(transcriptionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        audioBase64,
        audioFormat: {
          encoding: audioInfo.encoding,
          sampleRateHertz: audioInfo.sampleRate,
          extension: audioInfo.extension
        }
      }),
    });
    console.log("📡 [LOG] Resposta da API de transcrição recebida. Status:", transcriptionResponse.status);

    if (!transcriptionResponse.ok) {
      console.log("❌ [LOG] Erro na resposta da API de transcrição");
      const error = await transcriptionResponse.json();
      console.log("📄 [LOG] Detalhes do erro:", error);
      throw new Error(error.message || 'Erro na transcrição');
    }

    console.log("✅ [LOG] Extraindo dados da transcrição...");
    const { transcription } = await transcriptionResponse.json();
    console.log("📝 [LOG] Transcrição obtida:", transcription ? transcription.substring(0, 100) + "..." : "vazia");

    console.log("🎉 [LOG] Processamento concluído com sucesso!");
    return NextResponse.json({ 
      transcription,
      originalFile: file.name,
      processedFormat: 'Áudio Original (sem conversão)',
      sessionId 
    });

  } catch (error: unknown) {
    console.error("❌ [LOG] ERRO NO PROCESSAMENTO:", error);
    console.error("🔍 [LOG] Stack trace:", error instanceof Error ? error.stack : 'N/A');
    console.error("🔍 [LOG] Tipo do erro:", typeof error);
    console.error("🔍 [LOG] Nome do erro:", error instanceof Error ? error.constructor.name : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("📄 [LOG] Mensagem de erro:", errorMessage);
    
    return NextResponse.json({ 
      message: "Erro ao processar o arquivo.", 
      error: errorMessage,
      timestamp: new Date().toISOString(),
      tempPath: tempInputPath
    }, { status: 500 });
  } finally {
    console.log("🧹 [LOG] Limpando arquivo temporário...");
    // Limpar arquivo temporário
    if (tempInputPath) {
      try { 
        await unlink(tempInputPath); 
        console.log("✅ [LOG] Arquivo temporário removido:", tempInputPath);
      } catch (cleanupError) {
        console.error("⚠️ [LOG] Erro ao remover arquivo temporário:", cleanupError);
      }
    }
    console.log("🏁 [LOG] === PROCESSAMENTO FINALIZADO ===");
  }
} 