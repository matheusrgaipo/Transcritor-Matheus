import { SpeechClient } from "@google-cloud/speech";

export function createSpeechClient() {
  console.log("🔧 [LOG] === INICIANDO CRIAÇÃO DO GOOGLE SPEECH CLIENT ===");
  
  // Verificar se as credenciais estão disponíveis
  console.log("🔍 [LOG] Verificando credenciais do Google Cloud...");
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE;

  console.log("📧 [LOG] Client Email presente:", !!clientEmail);
  console.log("🔑 [LOG] Private Key presente:", !!privateKey);
  console.log("🆔 [LOG] Project ID presente:", !!projectId);

  // Diagnóstico detalhado das variáveis
  const missingVars = [];
  if (!clientEmail) missingVars.push("GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE");
  if (!privateKey) missingVars.push("GOOGLE_CLOUD_PRIVATE_KEY_STORAGE");
  if (!projectId) missingVars.push("GOOGLE_CLOUD_PROJECT_ID_STORAGE");

  if (missingVars.length > 0) {
    console.error("❌ [LOG] Variáveis de ambiente faltando:", missingVars.join(", "));
    console.error("🔍 [LOG] Todas as variáveis de ambiente disponíveis:");
    
    // Listar todas as variáveis que começam com GOOGLE_CLOUD
    const googleCloudVars = Object.keys(process.env).filter(key => key.startsWith('GOOGLE_CLOUD'));
    console.error("📋 [LOG] Variáveis Google Cloud encontradas:", googleCloudVars);
    
    // Mostrar valores parciais (sem expor credenciais completas)
    googleCloudVars.forEach(varName => {
      const value = process.env[varName];
      if (value) {
        console.error(`   ${varName}: ${value.substring(0, 20)}...`);
      } else {
        console.error(`   ${varName}: VAZIO`);
      }
    });
    
    throw new Error(`Credenciais do Google Cloud não configuradas. Variáveis faltando: ${missingVars.join(", ")}`);
  }

  try {
    console.log("🔄 [LOG] Formatando chave privada...");
    // Limpar e formatar a chave privada
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    console.log("✅ [LOG] Chave privada formatada");
    
    console.log("🔍 [LOG] Validando formato da chave privada...");
    // Validar se a chave privada tem o formato correto
    if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----") || 
        !formattedPrivateKey.includes("-----END PRIVATE KEY-----")) {
      console.error("❌ [LOG] Formato da chave privada inválido");
      console.error("🔍 [LOG] Chave contém BEGIN:", formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----"));
      console.error("🔍 [LOG] Chave contém END:", formattedPrivateKey.includes("-----END PRIVATE KEY-----"));
      console.error("🔍 [LOG] Primeiros 50 caracteres da chave:", formattedPrivateKey.substring(0, 50));
      console.error("🔍 [LOG] Últimos 50 caracteres da chave:", formattedPrivateKey.substring(formattedPrivateKey.length - 50));
      throw new Error("Formato da chave privada inválido");
    }
    console.log("✅ [LOG] Formato da chave privada válido");

    console.log("🔧 [LOG] Configurando Google Speech Client...");
    console.log("📧 [LOG] Client Email:", clientEmail);
    console.log("🔑 [LOG] Project ID:", projectId);
    
    console.log("🏗️ [LOG] Criando instância do SpeechClient...");
    const speechClient = new SpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      projectId: projectId,
    });
    console.log("✅ [LOG] SpeechClient criado com sucesso");
    
    return speechClient;
  } catch (error) {
    console.error("❌ [LOG] Erro ao criar Google Speech Client:", error);
    console.error("🔍 [LOG] Stack trace do erro:", error instanceof Error ? error.stack : 'N/A');
    console.error("🔍 [LOG] Tipo do erro:", typeof error);
    console.error("🔍 [LOG] Nome do erro:", error instanceof Error ? error.constructor.name : 'N/A');
    
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error("📄 [LOG] Mensagem de erro:", errorMessage);
    
    if (errorMessage.includes("ffmpeg")) {
      console.error("🚨 [LOG] ERRO DE FFMPEG DETECTADO NA CRIAÇÃO DO SPEECH CLIENT!");
    }
    
    throw new Error(`Erro na configuração do Google Cloud: ${errorMessage}`);
  } finally {
    console.log("🏁 [LOG] === CRIAÇÃO DO SPEECH CLIENT FINALIZADA ===");
  }
}

// Função para testar a conexão com o Google Cloud
export async function testGoogleCloudConnection() {
  console.log("🧪 [LOG] === INICIANDO TESTE DE CONEXÃO GOOGLE CLOUD ===");
  
  try {
    console.log("🔧 [LOG] Criando cliente para teste...");
    const client = createSpeechClient();
    console.log("✅ [LOG] Cliente criado para teste");
    
    console.log("📡 [LOG] Fazendo chamada de teste para Google Cloud...");
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
    
    if (errorMessage.includes("ffmpeg")) {
      console.error("🚨 [LOG] ERRO DE FFMPEG DETECTADO NO TESTE DE CONEXÃO!");
    }
    
    return false;
  } finally {
    console.log("🏁 [LOG] === TESTE DE CONEXÃO FINALIZADO ===");
  }
}