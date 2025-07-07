import { SpeechClient } from "@google-cloud/speech";
import { OAuth2Client } from "google-auth-library";

export function createSpeechClient() {
  console.log("🔧 [LOG] === INICIANDO CRIAÇÃO DO GOOGLE SPEECH CLIENT (OAuth 2.0) ===");
  
  // Verificar se as credenciais OAuth estão disponíveis
  console.log("🔍 [LOG] Verificando credenciais OAuth 2.0 do Google Cloud...");
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  console.log("🆔 [LOG] Client ID presente:", !!clientId);
  console.log("🔐 [LOG] Client Secret presente:", !!clientSecret);
  console.log("🔗 [LOG] Redirect URI presente:", !!redirectUri);
  console.log("🔄 [LOG] Refresh Token presente:", !!refreshToken);
  console.log("📁 [LOG] Project ID presente:", !!projectId);

  // Diagnóstico detalhado das variáveis
  const missingVars = [];
  if (!clientId) missingVars.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) missingVars.push("GOOGLE_CLIENT_SECRET");
  if (!redirectUri) missingVars.push("GOOGLE_REDIRECT_URI");
  if (!projectId) missingVars.push("GOOGLE_CLOUD_PROJECT_ID");

  if (missingVars.length > 0) {
    console.error("❌ [LOG] Variáveis de ambiente OAuth faltando:", missingVars.join(", "));
    console.error("🔍 [LOG] Todas as variáveis de ambiente disponíveis:");
    
    // Listar todas as variáveis que começam com GOOGLE_
    const googleVars = Object.keys(process.env).filter(key => key.startsWith('GOOGLE_'));
    console.error("📋 [LOG] Variáveis Google encontradas:", googleVars);
    
    // Mostrar valores parciais (sem expor credenciais completas)
    googleVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.error(`   ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.error(`   ${varName}: VAZIO`);
      }
    });
    
    throw new Error(`Credenciais OAuth 2.0 não configuradas. Variáveis faltando: ${missingVars.join(", ")}`);
  }

  try {
    console.log("🔧 [LOG] Configurando autenticação OAuth 2.0...");
    
    if (refreshToken) {
      console.log("🔄 [LOG] Usando Refresh Token para autenticação automática");
      
      // ✅ CORREÇÃO: Criar OAuth2Client explicitamente
      const oauth2Client = new OAuth2Client({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUri: redirectUri,
      });
      
      // Configurar refresh token
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
      
      console.log("✅ [LOG] OAuth2Client configurado com refresh token");
      
      // ✅ CORREÇÃO: Passar oauth2Client diretamente para SpeechClient
      const speechClient = new SpeechClient({
        auth: oauth2Client as any, // Força o tipo para evitar erro de compatibilidade
        projectId: projectId,
      });
      
      console.log("✅ [LOG] SpeechClient criado com sucesso usando OAuth 2.0");
      return speechClient;
      
    } else {
      console.log("⚠️ [LOG] Refresh Token não encontrado");
      console.log("🔗 [LOG] Será necessário implementar fluxo de autorização");
      
      // Sem refresh token, precisamos implementar fluxo de autorização
      // Por enquanto, vamos gerar a URL de autorização
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('https://www.googleapis.com/auth/cloud-platform')}&` +
        `access_type=offline&` +
        `prompt=consent`;
      
      console.log("🔗 [LOG] URL de autorização gerada:");
      console.log("🔗 [LOG]", authUrl);
      
      throw new Error(`Refresh Token necessário. Acesse esta URL para autorizar: ${authUrl}`);
    }
    
  } catch (error) {
    console.error("❌ [LOG] Erro ao criar Google Speech Client:", error);
    console.error("🔍 [LOG] Stack trace do erro:", error instanceof Error ? error.stack : 'N/A');
    console.error("🔍 [LOG] Tipo do erro:", typeof error);
    console.error("🔍 [LOG] Nome do erro:", error instanceof Error ? error.constructor.name : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("📄 [LOG] Mensagem de erro:", errorMessage);
    
    throw new Error(`Erro na configuração OAuth 2.0: ${errorMessage}`);
  } finally {
    console.log("🏁 [LOG] === CRIAÇÃO DO SPEECH CLIENT FINALIZADA ===");
  }
}

// Função para trocar código de autorização por refresh token
export async function exchangeCodeForTokens(authCode: string) {
  console.log("🔄 [LOG] === TROCANDO CÓDIGO POR TOKENS ===");
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: authCode,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri!,
        grant_type: 'authorization_code',
      }),
    });
    
    const tokens = await response.json();
    console.log("✅ [LOG] Tokens obtidos com sucesso");
    console.log("🔑 [LOG] Refresh Token:", tokens.refresh_token ? "Presente" : "Ausente");
    
    return tokens;
  } catch (error) {
    console.error("❌ [LOG] Erro ao trocar código por tokens:", error);
    throw error;
  }
}

// Função para testar a conexão com o Google Cloud
export async function testGoogleCloudConnection() {
  console.log("🧪 [LOG] === INICIANDO TESTE DE CONEXÃO GOOGLE CLOUD (OAuth 2.0) ===");
  
  try {
    console.log("🔧 [LOG] Criando cliente para teste...");
    const client = createSpeechClient();
    console.log("✅ [LOG] Cliente criado para teste");
    
    console.log("📡 [LOG] Testando autenticação com Google Cloud...");
    // Fazer uma chamada simples para testar a autenticação
    await client.longRunningRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'pt-BR',
      },
      audio: {
        content: Buffer.from([]).toString('base64'), // Áudio vazio para teste
      },
    });
    
    console.log("✅ [LOG] Conexão com Google Cloud Speech API estabelecida");
    return true;
  } catch (error) {
    console.error("❌ [LOG] Erro ao testar conexão:", error);
    console.error("🔍 [LOG] Stack trace do erro de teste:", error instanceof Error ? error.stack : 'N/A');
    console.error("🔍 [LOG] Tipo do erro de teste:", typeof error);
    console.error("🔍 [LOG] Nome do erro de teste:", error instanceof Error ? error.constructor.name : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("📄 [LOG] Mensagem de erro de teste:", errorMessage);
    
    return false;
  } finally {
    console.log("🏁 [LOG] === TESTE DE CONEXÃO FINALIZADO ===");
  }
}