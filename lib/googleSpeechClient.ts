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
    console.log("🔍 [LOG] Chave privada original - tamanho:", privateKey.length);
    console.log("🔍 [LOG] Chave privada original - primeiros 100 chars:", privateKey.substring(0, 100));
    console.log("🔍 [LOG] Chave privada original - últimos 100 chars:", privateKey.substring(privateKey.length - 100));
    
    // Limpar e formatar a chave privada
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    console.log("🔍 [LOG] Chave privada formatada - tamanho:", formattedPrivateKey.length);
    console.log("🔍 [LOG] Chave privada formatada - primeiros 100 chars:", formattedPrivateKey.substring(0, 100));
    console.log("🔍 [LOG] Chave privada formatada - últimos 100 chars:", formattedPrivateKey.substring(formattedPrivateKey.length - 100));
    console.log("✅ [LOG] Chave privada formatada");
    
    console.log("🔍 [LOG] Validando formato da chave privada...");
    const hasBegin = formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----");
    const hasEnd = formattedPrivateKey.includes("-----END PRIVATE KEY-----");
    
    console.log("🔍 [LOG] Chave contém BEGIN:", hasBegin);
    console.log("🔍 [LOG] Chave contém END:", hasEnd);
    
    // Verificar se a chave privada tem o formato correto
    if (!hasBegin || !hasEnd) {
      console.error("❌ [LOG] Formato da chave privada inválido");
      console.error("🔍 [LOG] Chave contém BEGIN:", hasBegin);
      console.error("🔍 [LOG] Chave contém END:", hasEnd);
      console.error("🔍 [LOG] Primeiros 200 caracteres da chave:", formattedPrivateKey.substring(0, 200));
      console.error("🔍 [LOG] Últimos 200 caracteres da chave:", formattedPrivateKey.substring(formattedPrivateKey.length - 200));
      
      // Tentar diferentes formatos
      console.log("🔧 [LOG] Tentando corrigir formato automaticamente...");
      
      // Remover aspas se existirem
      let correctedKey = formattedPrivateKey.replace(/^"/, '').replace(/"$/, '');
      console.log("🔍 [LOG] Após remover aspas - tamanho:", correctedKey.length);
      
      // Tentar diferentes padrões de escape
      const patterns = [
        correctedKey.replace(/\\n/g, "\n"),
        correctedKey.replace(/\\\\/g, "\\"),
        correctedKey.replace(/\\"/g, '"'),
        correctedKey.replace(/\\r\\n/g, "\n"),
        correctedKey.replace(/\\r/g, "\n"),
      ];
      
      for (let i = 0; i < patterns.length; i++) {
        const testKey = patterns[i];
        const testHasBegin = testKey.includes("-----BEGIN PRIVATE KEY-----");
        const testHasEnd = testKey.includes("-----END PRIVATE KEY-----");
        
        console.log(`🧪 [LOG] Teste ${i + 1}: BEGIN=${testHasBegin}, END=${testHasEnd}`);
        
        if (testHasBegin && testHasEnd) {
          console.log(`✅ [LOG] Formato corrigido no teste ${i + 1}`);
          console.log("🔍 [LOG] Chave corrigida - primeiros 100 chars:", testKey.substring(0, 100));
          console.log("🔍 [LOG] Chave corrigida - últimos 100 chars:", testKey.substring(testKey.length - 100));
          
          // Usar a chave corrigida
          const speechClient = new SpeechClient({
            credentials: {
              client_email: clientEmail,
              private_key: testKey,
            },
            projectId: projectId,
          });
          console.log("✅ [LOG] SpeechClient criado com sucesso usando chave corrigida");
          return speechClient;
        }
      }
      
      throw new Error("Formato da chave privada inválido - não foi possível corrigir automaticamente");
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