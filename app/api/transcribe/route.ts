import { NextRequest, NextResponse } from "next/server";
import { createSpeechClient } from "@/lib/googleSpeechClient";

export async function POST(req: NextRequest) {
  try {
    const { audioBase64 } = await req.json();

    if (!audioBase64) {
      return NextResponse.json({ message: "Áudio em base64 é obrigatório." }, { status: 400 });
    }

    console.log("🎙️ Iniciando transcrição...");
    console.log("📊 Tamanho do áudio:", (audioBase64.length / 1024).toFixed(2), "KB");

    // Criar cliente do Google Speech
    let client;
    try {
      client = createSpeechClient();
      console.log("✅ Cliente Google Speech criado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao criar cliente:", error);
      return NextResponse.json({ 
        message: "Erro de configuração do Google Cloud Speech API",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: "Verifique se as credenciais do Google Cloud estão configuradas corretamente"
      }, { status: 500 });
    }

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

    console.log("🔄 Enviando para Google Speech API...");
    
    try {
      const [response] = await client.recognize(request);
      
      if (!response.results || response.results.length === 0) {
        console.log("⚠️ Nenhum resultado de transcrição encontrado");
        return NextResponse.json({ 
          message: "Nenhum áudio foi detectado ou o áudio está muito baixo",
          transcription: "",
          confidence: 0
        });
      }

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

      console.log("✅ Transcrição concluída");
      console.log("📝 Texto:", transcription.substring(0, 100) + "...");
      console.log("🎯 Confiança:", (averageConfidence * 100).toFixed(1) + "%");

      return NextResponse.json({
        transcription,
        confidence: averageConfidence,
        resultsCount: response.results.length,
        message: "Transcrição realizada com sucesso"
      });

    } catch (speechError: unknown) {
      console.error("❌ Erro na API do Google Speech:", speechError);
      
      let errorMessage = "Erro na transcrição";
      let errorDetails = "Erro desconhecido";
      
      if (speechError instanceof Error) {
        errorMessage = speechError.message;
        
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
    console.error("❌ Erro geral na transcrição:", error);
    return NextResponse.json({
      message: "Erro interno do servidor",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
} 