import { NextResponse } from "next/server";
import { createSpeechClient } from "@/lib/googleSpeechClient";

export async function GET() {
  try {
    const envVars = {
      // Google Cloud OAuth 2.0
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: !!process.env.GOOGLE_REDIRECT_URI,
      GOOGLE_REFRESH_TOKEN: !!process.env.GOOGLE_REFRESH_TOKEN,
      GOOGLE_CLOUD_PROJECT_ID: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
    
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      
      // App
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    };

    // Capturar logs detalhados
    const logs: string[] = [];
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    
    console.log = (...args) => {
      logs.push(`[LOG] ${args.join(' ')}`);
      originalConsoleLog(...args);
    };
    
    console.error = (...args) => {
      logs.push(`[ERROR] ${args.join(' ')}`);
      originalConsoleError(...args);
    };

    // Testar Google Cloud Speech Client
    let googleCloudStatus = "❌ Não configurado";
    let googleCloudError = null;
    
    try {
      createSpeechClient();
      googleCloudStatus = "✅ Cliente criado com sucesso";
      
      // Verificar se as credenciais OAuth têm o formato correto
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;
      const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
      
      if (clientId && clientSecret && redirectUri) {
        if (clientId.includes(".googleusercontent.com")) {
          googleCloudStatus += " | Client ID válido";
        } else {
          googleCloudStatus += " | ⚠️ Client ID pode estar inválido";
        }
        
        if (redirectUri.startsWith("http")) {
          googleCloudStatus += " | Redirect URI válido";
        } else {
          googleCloudStatus += " | ⚠️ Redirect URI inválido";
        }
        
        if (refreshToken) {
          googleCloudStatus += " | Refresh Token presente";
        } else {
          googleCloudStatus += " | ⚠️ Refresh Token ausente";
        }
      }
      
    } catch (error) {
      googleCloudError = error instanceof Error ? error.message : "Erro desconhecido";
      googleCloudStatus = `❌ Erro: ${googleCloudError}`;
    } finally {
      // Restaurar console original
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    }

    // Análise detalhada das credenciais OAuth
    const oauthAnalysis = {
      clientId: {
        present: !!process.env.GOOGLE_CLIENT_ID,
        length: process.env.GOOGLE_CLIENT_ID?.length || 0,
        endsWithGoogleDomain: process.env.GOOGLE_CLIENT_ID?.includes(".googleusercontent.com") || false,
        preview: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "..." || "N/A"
      },
      clientSecret: {
        present: !!process.env.GOOGLE_CLIENT_SECRET,
        length: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
        preview: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) + "..." || "N/A"
      },
      redirectUri: {
        present: !!process.env.GOOGLE_REDIRECT_URI,
        isHttps: process.env.GOOGLE_REDIRECT_URI?.startsWith("https://") || false,
        value: process.env.GOOGLE_REDIRECT_URI || "N/A"
      },
      refreshToken: {
        present: !!process.env.GOOGLE_REFRESH_TOKEN,
        length: process.env.GOOGLE_REFRESH_TOKEN?.length || 0,
        preview: process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 10) + "..." || "N/A"
      }
    };

    return NextResponse.json({
      message: "Teste de variáveis de ambiente OAuth 2.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars,
      googleCloud: {
        status: googleCloudStatus,
        error: googleCloudError,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || "Não configurado",
        authMethod: "OAuth 2.0"
      },
      oauthAnalysis: oauthAnalysis,
      detailedLogs: logs
    });
  } catch (error) {
    return NextResponse.json({
      message: "Erro ao testar variáveis de ambiente",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
} 