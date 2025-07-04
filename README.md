# 🎤 Matheus o Transcritor

Aplicação web moderna para transcrição de áudio e vídeo usando Google Cloud Speech-to-Text API. Desenvolvida com Next.js 15, React 19, TypeScript e Supabase.

## 📋 Visão Geral

O "Matheus o Transcritor" é uma ferramenta completa de transcrição que permite aos usuários fazer upload de arquivos de áudio ou vídeo e obter transcrições precisas em português brasileiro. A aplicação inclui autenticação segura, processamento de arquivos multimídia e uma interface moderna e intuitiva.

## ✨ Funcionalidades Principais

### 🔐 Autenticação Completa
- **Login com Email/Senha**: Sistema de autenticação tradicional
- **Login com Google OAuth**: Integração com Google para acesso rápido
- **Proteção de Rotas**: Middleware automático para proteger páginas privadas
- **Gerenciamento de Sessões**: Sessões seguras com Supabase Auth

### 🎵 Processamento de Arquivos
- **Suporte Multimídia**: Aceita arquivos de áudio e vídeo
- **Conversão Automática**: FFmpeg integrado para conversão para formato otimizado
- **Formatos Suportados**: MP3, MP4, WAV, M4A, MOV, AVI e outros
- **Otimização**: Conversão automática para FLAC 16kHz mono

### 🤖 Transcrição Inteligente
- **Google Cloud Speech-to-Text**: API v1 para máxima precisão
- **Português Brasileiro**: Otimizado para idioma português
- **Pontuação Automática**: Adiciona pontuação automaticamente
- **Arquivos Longos**: Suporte para transcrições longas via Google Cloud Storage

### 🎨 Interface Moderna
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Drag & Drop**: Interface intuitiva para upload de arquivos
- **Barra de Progresso**: Feedback visual durante o processamento
- **Tema Limpo**: Design moderno com Tailwind CSS e Shadcn/UI

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com App Router
- **React 19**: Biblioteca JavaScript para interfaces
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/UI**: Componentes de UI acessíveis
- **Lucide React**: Ícones modernos
- **Framer Motion**: Animações suaves

### Backend & Serviços
- **Supabase**: Backend-as-a-Service para autenticação e banco de dados
- **Google Cloud Speech-to-Text**: API de transcrição
- **Google Cloud Storage**: Armazenamento de arquivos
- **FFmpeg**: Processamento de arquivos multimídia
- **Next.js API Routes**: Endpoints do servidor

### Autenticação & Segurança
- **Supabase Auth**: Sistema de autenticação completo
- **Google OAuth**: Integração com Google
- **Middleware de Proteção**: Verificação automática de rotas
- **Cookies Seguros**: Gerenciamento seguro de sessões

## 🚀 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- NPM ou PNPM
- Conta no Google Cloud Platform
- Conta no Supabase

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/matheus-transcritor.git
cd matheus-transcritor
```

### 2. Instale as Dependências
```bash
npm install
# ou
pnpm install
```

### 3. Configure as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=caminho_para_seu_arquivo_de_credenciais.json
GOOGLE_CLOUD_PROJECT_ID=seu_project_id
GOOGLE_CLOUD_STORAGE_BUCKET=seu_bucket_name

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret
```

### 4. Configure o Google Cloud

#### 4.1 Ative as APIs necessárias:
```bash
gcloud services enable speech.googleapis.com
gcloud services enable storage.googleapis.com
```

#### 4.2 Configure a autenticação:
```bash
gcloud auth application-default login
```

#### 4.3 Crie um bucket no Google Cloud Storage:
```bash
gsutil mb gs://seu-bucket-name
```

### 5. Configure o Supabase

#### 5.1 Crie um novo projeto no [Supabase](https://supabase.com)

#### 5.2 Configure a autenticação:
- Vá para Authentication > Settings
- Configure os providers desejados (Email, Google)
- Adicione sua URL de callback: `http://localhost:3001/auth/callback`

#### 5.3 (Opcional) Configure Google OAuth:
- Vá para Authentication > Providers > Google
- Adicione seu Google Client ID e Secret

### 6. Inicie o Servidor
```bash
npm run dev
# ou
pnpm dev
```

A aplicação estará disponível em `http://localhost:3001`

## 📁 Estrutura do Projeto

```
matheus-transcritor/
├── app/                    # Páginas e layouts da aplicação
│   ├── api/               # Endpoints da API
│   │   ├── auth/         # Rotas de autenticação
│   │   ├── transcribe/   # API de transcrição
│   │   └── process-video/ # Processamento de arquivos
│   ├── login/            # Página de login
│   └── page.tsx          # Página principal
├── components/            # Componentes reutilizáveis
│   ├── auth/             # Componentes de autenticação
│   ├── providers/        # Providers de contexto
│   ├── shared/           # Componentes compartilhados
│   └── ui/               # Componentes de UI
├── hooks/                # Hooks customizados
├── lib/                  # Utilitários e configurações
├── middleware.ts         # Middleware de autenticação
└── types/                # Definições de tipos TypeScript
```

## 🔧 APIs e Endpoints

### `/api/transcribe`
- **Método**: POST
- **Função**: Transcreve arquivos de áudio
- **Parâmetros**: FormData com arquivo de áudio
- **Resposta**: Texto transcrito

### `/api/process-video`
- **Método**: POST
- **Função**: Processa arquivos de vídeo/áudio e transcreve
- **Parâmetros**: FormData com arquivo multimídia
- **Resposta**: Texto transcrito

### `/api/auth/login`
- **Método**: POST
- **Função**: Autentica usuário
- **Parâmetros**: Email e senha
- **Resposta**: Token de autenticação

## 🎯 Como Usar

### 1. **Faça Login**
- Acesse a aplicação
- Faça login com email/senha ou Google
- Você será redirecionado para a página principal

### 2. **Faça Upload do Arquivo**
- Clique na área de upload ou arraste um arquivo
- Suporte para arquivos de áudio e vídeo
- Tamanho máximo recomendado: 100MB

### 3. **Processe e Transcreva**
- Clique em "Processar & Transcrever"
- Acompanhe o progresso na barra de status
- Aguarde a conclusão do processamento

### 4. **Obtenha a Transcrição**
- O texto transcrito aparecerá na área de resultado
- Você pode copiar o texto ou fazer novo upload

## 🔒 Segurança

- **Autenticação Obrigatória**: Todas as rotas são protegidas
- **Middleware de Proteção**: Verificação automática de sessões
- **Cookies Seguros**: Gerenciamento seguro de autenticação
- **Validação de Arquivos**: Verificação de tipos de arquivo
- **Rate Limiting**: Proteção contra abuso da API

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- Netlify
- Railway
- Render
- AWS
- Google Cloud Run

## 📊 Monitoramento

- **Logs do Google Cloud**: Monitoramento de transcrições
- **Supabase Analytics**: Métricas de autenticação
- **Next.js Analytics**: Performance da aplicação

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👤 Autor

- **Matheus Gaipo** - Desenvolvedor Principal
- **Equipe Turbo** - Suporte e Desenvolvimento

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento
- Consulte a documentação das APIs utilizadas

---

⭐ **Não se esqueça de deixar uma estrela se este projeto foi útil para você!**

## 📚 Recursos Adicionais

- [Documentação do Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text/docs)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do FFmpeg](https://ffmpeg.org/documentation.html)
