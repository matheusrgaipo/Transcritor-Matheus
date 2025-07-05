import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/googleSpeechClient";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log("🔗 [LOG] === CALLBACK OAUTH RECEBIDO ===");
  console.log("🔑 [LOG] Código presente:", !!code);
  console.log("❌ [LOG] Erro presente:", !!error);

  if (error) {
    console.error("❌ [LOG] Erro na autorização OAuth:", error);
    return NextResponse.json({
      message: "Erro na autorização OAuth",
      error: error,
    }, { status: 400 });
  }

  if (!code) {
    console.error("❌ [LOG] Código de autorização não encontrado");
    return NextResponse.json({
      message: "Código de autorização não encontrado",
    }, { status: 400 });
  }

  try {
    console.log("🔄 [LOG] Trocando código por tokens...");
    const tokens = await exchangeCodeForTokens(code);
    
    console.log("✅ [LOG] Tokens obtidos com sucesso");
    console.log("🔑 [LOG] Access Token:", tokens.access_token ? "Presente" : "Ausente");
    console.log("🔄 [LOG] Refresh Token:", tokens.refresh_token ? "Presente" : "Ausente");
    console.log("⏰ [LOG] Expires In:", tokens.expires_in);

    return NextResponse.json({
      message: "Autorização OAuth concluída com sucesso",
      tokens: {
        access_token: tokens.access_token ? "Presente" : "Ausente",
        refresh_token: tokens.refresh_token ? "Presente" : "Ausente",
        expires_in: tokens.expires_in,
      },
      instructions: {
        message: "Adicione o refresh_token como variável de ambiente no Vercel",
        variable: "GOOGLE_REFRESH_TOKEN",
        value: tokens.refresh_token,
        note: "Após adicionar a variável, faça redeploy do projeto"
      }
    });

  } catch (error) {
    console.error("❌ [LOG] Erro ao trocar código por tokens:", error);
    return NextResponse.json({
      message: "Erro ao trocar código por tokens",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}

// Rota para gerar URL de autorização
export async function POST() {
  console.log("🔗 [LOG] === GERANDO URL DE AUTORIZAÇÃO ===");
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    return NextResponse.json({
      message: "Credenciais OAuth não configuradas",
      missing: {
        clientId: !clientId,
        redirectUri: !redirectUri
      }
    }, { status: 400 });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/cloud-platform')}&` +
    `access_type=offline&` +
    `prompt=consent`;

  console.log("✅ [LOG] URL de autorização gerada");
  
  return NextResponse.json({
    message: "URL de autorização gerada",
    authUrl: authUrl,
    instructions: [
      "1. Acesse a URL de autorização",
      "2. Faça login com sua conta Google",
      "3. Autorize o acesso às APIs do Google Cloud",
      "4. Você será redirecionado de volta com o refresh token",
      "5. Adicione o refresh token como variável de ambiente no Vercel"
    ]
  });
} 