# Configuração de Variáveis de Ambiente no Vercel

## 🔧 Variáveis Obrigatórias

### Google Cloud Speech API
```bash
GOOGLE_CLOUD_PROJECT_ID_STORAGE=seu-projeto-id
GOOGLE_CLOUD_CLIENT_EMAIL_STORAGE=sua-service-account@seu-projeto.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY_STORAGE="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----"
```

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anonima
```

### App
```bash
NEXT_PUBLIC_APP_URL=https://transcritor-matheus-ky8c.vercel.app
```

## 📋 Passos para Configurar no Vercel

1. **Acesse o Dashboard do Vercel**
   - Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecione seu projeto

2. **Configurar Variáveis de Ambiente**
   - Vá para **Settings** → **Environment Variables**
   - Adicione cada variável listada acima

3. **Importante para Google Cloud Private Key**
   - Cole a chave privada **com aspas duplas**
   - Mantenha as quebras de linha como `\n`
   - Exemplo: `"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"`

4. **Redeploy**
   - Após configurar todas as variáveis, faça um redeploy
   - Ou simplesmente faça um push para o repositório

## 🧪 Teste das Configurações

Após configurar, teste em:
- `https://seu-dominio.vercel.app/api/test-env`

## ⚠️ Troubleshooting

### Erro: "Credenciais do Google Cloud não configuradas"
- Verifique se todas as 3 variáveis do Google Cloud estão configuradas
- Certifique-se de que a chave privada está com o formato correto

### Erro: "Formato da chave privada inválido"
- A chave deve começar com `-----BEGIN PRIVATE KEY-----`
- A chave deve terminar com `-----END PRIVATE KEY-----`
- Use aspas duplas ao configurar no Vercel

### Erro de Email Inválido
- O email deve ter formato: `nome@projeto.iam.gserviceaccount.com`
- Verifique se é o email da Service Account, não um email pessoal 