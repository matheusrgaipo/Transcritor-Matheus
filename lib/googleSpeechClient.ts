import { SpeechClient } from "@google-cloud/speech";

export function createSpeechClient() {
  // Verificar se as credenciais estão disponíveis
  const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE;
  const privateKey = process.env.GOOGLE_CLOUD_PRIVATE_KEY_STORAGE;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID_STORAGE;

  if (!clientEmail || !privateKey || !projectId) {
    console.error("❌ Credenciais do Google Cloud não configuradas:");
    console.error("- CLIENT_EMAIL:", !!clientEmail);
    console.error("- PRIVATE_KEY:", !!privateKey);
    console.error("- PROJECT_ID:", !!projectId);
    throw new Error("Credenciais do Google Cloud não configuradas. Verifique as variáveis de ambiente.");
  }

  try {
    // Limpar e formatar a chave privada
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    
    // Validar se a chave privada tem o formato correto
    if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----") || 
        !formattedPrivateKey.includes("-----END PRIVATE KEY-----")) {
      throw new Error("Formato da chave privada inválido");
    }

    console.log("🔧 Configurando Google Speech Client...");
    console.log("📧 Client Email:", clientEmail);
    console.log("🔑 Project ID:", projectId);
    
    return new SpeechClient({
      credentials: {
        client_email: clientEmail,
        private_key: formattedPrivateKey,
      },
      projectId: projectId,
    });
  } catch (error) {
    console.error("❌ Erro ao criar Google Speech Client:", error);
    throw new Error(`Erro na configuração do Google Cloud: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

// Função para testar a conexão com o Google Cloud
export async function testGoogleCloudConnection() {
  try {
    const client = createSpeechClient();
    
    // Fazer uma chamada simples para testar a autenticação
    const [operation] = await client.longRunningRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'pt-BR',
      },
      audio: {
        content: Buffer.from([]).toString('base64'), // Áudio vazio para teste
      },
    });
    
    console.log("✅ Conexão com Google Cloud Speech API estabelecida");
    return true;
  } catch (error) {
    console.error("❌ Erro ao testar conexão:", error);
    return false;
  }
}