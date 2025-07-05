import { NextResponse } from "next/server";
import { createSpeechClient } from "@/lib/googleSpeechClient";

export async function GET() {
  try {
    const envVars = {
      // Google Cloud
              GOOGLE_CLOUD_PROJECT_ID_STORAGE: !!process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE,
        GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE: !!process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE,
        GOOGLE_CLOUD_PRIVATE_KEY_STORAGE: !!process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE,
        GOOGLE_CLOUD_BUCKET_NAME_STORAGE: !!process.env.GOOGLE_CLOUD_BUCKET_NAME_STORAGE,
      GOOGLE_CLOUD_RECOGNIZER_ID: !!process.env.GOOGLE_CLOUD_RECOGNIZER_ID,
    
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      
      // App
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    };

    // Testar Google Cloud Speech Client
    let googleCloudStatus = "❌ Não configurado";
    let googleCloudError = null;
    
    try {
      createSpeechClient();
      googleCloudStatus = "✅ Cliente criado com sucesso";
      
      // Verificar se as credenciais têm o formato correto
      const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE;
      const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE;
      
      if (clientEmail && privateKey) {
        if (clientEmail.includes("@") && clientEmail.includes(".iam.gserviceaccount.com")) {
          googleCloudStatus += " | Email válido";
        } else {
          googleCloudStatus += " | ⚠️ Email pode estar inválido";
        }
        
        if (privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
          googleCloudStatus += " | Chave privada válida";
        } else {
          googleCloudStatus += " | ⚠️ Chave privada inválida";
        }
      }
      
    } catch (error) {
      googleCloudError = error instanceof Error ? error.message : "Erro desconhecido";
      googleCloudStatus = `❌ Erro: ${googleCloudError}`;
    }

    return NextResponse.json({
      message: "Teste de variáveis de ambiente",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars,
      googleCloud: {
        status: googleCloudStatus,
        error: googleCloudError,
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE || "Não configurado",
        clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE ? 
          process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE.substring(0, 20) + "..." : "Não configurado",
      }
    });
  } catch (error) {
    return NextResponse.json({
      message: "Erro ao testar variáveis de ambiente",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
} 