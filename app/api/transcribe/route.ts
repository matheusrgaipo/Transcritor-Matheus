import { NextRequest, NextResponse } from "next/server";
import { createSpeechClient } from "@/lib/googleSpeechClient";

export async function POST(req: NextRequest) {
  console.log("🎙️ [LOG] === INICIANDO API DE TRANSCRIÇÃO ===");
  console.log("📅 [LOG] Timestamp:", new Date().toISOString());
  
  try {
    console.log("📥 [LOG] Recebendo dados JSON...");
    const { audioBase64 } = await req.json();
    console.log("✅ [LOG] Dados JSON recebidos");

    if (!audioBase64) {
      console.log("❌ [LOG] Áudio em base64 não fornecido");
      return NextResponse.json({ message: "Áudio em base64 é obrigatório." }, { status: 400 });
    }

    console.log("🎙️ [LOG] Iniciando transcrição...");
    console.log("📊 [LOG] Tamanho do áudio:", (audioBase64.length / 1024).toFixed(2), "KB");

    console.log("🔧 [LOG] Criando cliente do Google Speech...");
    // Criar cliente do Google Speech
    let client;
    try {
      client = createSpeechClient();
      console.log("✅ [LOG] Cliente Google Speech criado com sucesso");
    } catch (error) {
      console.error("❌ [LOG] Erro ao criar cliente:", error);
      console.error("🔍 [LOG] Stack trace do erro do cliente:", error instanceof Error ? error.stack : 'N/A');
      return NextResponse.json({ 
        message: "Erro de configuração do Google Cloud Speech API",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: "Verifique se as credenciais do Google Cloud estão configuradas corretamente"
      }, { status: 500 });
    }

    console.log("⚙️ [LOG] Configurando requisição de transcrição...");
    // Configuração da transcrição
    const request = {
      config: {
        encoding: 'WEBM_OPUS' as const, // Formato mais comum para arquivos web
        sampleRateHertz: 48000, // Taxa padrão para WebM
        languageCode: 'pt-BR',
        alternativeLanguageCodes: ['pt-PT', 'en-US'],
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
        model: 'latest_long', // Modelo otimizado para áudio longo
        useEnhanced: true,
      },
      audio: {
        content: audioBase64,
      },
    };
    console.log("✅ [LOG] Configuração da requisição criada");

    console.log("🔄 [LOG] Enviando para Google Speech API...");
    
    try {
      console.log("📡 [LOG] Chamando client.recognize()...");
      const [response] = await client.recognize(request);
      console.log("✅ [LOG] Resposta recebida do Google Speech API");
      
      if (!response.results || response.results.length === 0) {
        console.log("⚠️ [LOG] Nenhum resultado de transcrição encontrado");
        return NextResponse.json({ 
          message: "Nenhum áudio foi detectado ou o áudio está muito baixo",
          transcription: "",
          confidence: 0
        });
      }

      console.log("🔄 [LOG] Processando resultados da transcrição...");
      // Combinar todos os resultados
      const transcription = response.results
        .map(result => result.alternatives?.[0]?.transcript || '')
        .join(' ')
        .trim();

      // Calcular confiança média
      const confidences = response.results
        .map(result => result.alternatives?.[0]?.confidence || 0)
        .filter(conf => conf > 0);
      
      const averageConfidence = confidences.length > 0 
        ? confidences.reduce((a, b) => a + b, 0) / confidences.length 
        : 0;

      console.log("✅ [LOG] Transcrição concluída");
      console.log("📝 [LOG] Texto:", transcription.substring(0, 100) + "...");
      console.log("🎯 [LOG] Confiança:", (averageConfidence * 100).toFixed(1) + "%");
      console.log("📊 [LOG] Número de resultados:", response.results.length);

      return NextResponse.json({
        transcription,
        confidence: averageConfidence,
        resultsCount: response.results.length,
        message: "Transcrição realizada com sucesso"
      });

    } catch (speechError: unknown) {
      console.error("❌ [LOG] Erro na API do Google Speech:", speechError);
      console.error("🔍 [LOG] Stack trace do erro do Speech:", speechError instanceof Error ? speechError.stack : 'N/A');
      console.error("🔍 [LOG] Tipo do erro do Speech:", typeof speechError);
      console.error("🔍 [LOG] Nome do erro do Speech:", speechError instanceof Error ? speechError.constructor.name : 'N/A');
      
      let errorMessage = "Erro na transcrição";
      let errorDetails = "Erro desconhecido";
      
      if (speechError instanceof Error) {
        errorMessage = speechError.message;
        console.error("📄 [LOG] Mensagem de erro do Speech:", errorMessage);
        
        // Tratar erros específicos do Google Cloud
        if (errorMessage.includes("invalid_grant")) {
          errorDetails = "Credenciais do Google Cloud inválidas ou expiradas. Verifique as variáveis de ambiente.";
        } else if (errorMessage.includes("invalid_rapt")) {
          errorDetails = "Problema de autenticação com o Google Cloud. Verifique se as credenciais estão corretas.";
        } else if (errorMessage.includes("PERMISSION_DENIED")) {
          errorDetails = "Permissão negada. Verifique se a conta de serviço tem as permissões necessárias.";
        } else if (errorMessage.includes("INVALID_ARGUMENT")) {
          errorDetails = "Formato de áudio inválido ou configuração incorreta.";
        } else if (errorMessage.includes("RESOURCE_EXHAUSTED")) {
          errorDetails = "Cota da API excedida. Tente novamente mais tarde.";
        } else if (errorMessage.includes("ffmpeg")) {
          errorDetails = "DETECTADO ERRO DE FFMPEG! Isso não deveria acontecer nesta API.";
          console.error("🚨 [LOG] ERRO DE FFMPEG DETECTADO NA API DE TRANSCRIÇÃO!");
        }
      }

      return NextResponse.json({
        message: "Erro ao processar o áudio",
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("❌ [LOG] Erro geral na transcrição:", error);
    console.error("🔍 [LOG] Stack trace do erro geral:", error instanceof Error ? error.stack : 'N/A');
    console.error("🔍 [LOG] Tipo do erro geral:", typeof error);
    console.error("🔍 [LOG] Nome do erro geral:", error instanceof Error ? error.constructor.name : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("📄 [LOG] Mensagem de erro geral:", errorMessage);
    
    if (errorMessage.includes("ffmpeg")) {
      console.error("🚨 [LOG] ERRO DE FFMPEG DETECTADO NO CATCH GERAL!");
    }
    
    return NextResponse.json({
      message: "Erro interno do servidor",
      error: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    console.log("🏁 [LOG] === API DE TRANSCRIÇÃO FINALIZADA ===");
  }
} 