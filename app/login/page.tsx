"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setError("");
    
    try {
      console.log("🔐 Iniciando login com Google...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        console.error("❌ Erro no login Google:", error);
        setError("Erro ao fazer login com Google: " + error.message);
      } else {
        console.log("✅ Login Google iniciado!");
        // O redirecionamento será automático
      }
    } catch (err) {
      console.error("🚨 Erro no login Google:", err);
      setError("Erro de conexão com Google");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log(`🔐 Tentando ${isSignUp ? 'cadastro' : 'login'} com:`, { email });

      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { data, error } = result;

      if (error) {
        console.error("❌ Erro na autenticação:", error);
        setError(error.message);
      } else if (data.user) {
        console.log("✅ Autenticação bem-sucedida!");
        if (isSignUp) {
          setError("Cadastro realizado! Verifique seu email para confirmar a conta.");
        } else {
          console.log("🔄 Redirecionando para página principal...");
          router.push("/");
        }
      }
    } catch (err: any) {
      console.error("🚨 Erro na requisição:", err);
      setError("Erro de conexão com o servidor");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e Título */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UploadCloud className="w-8 h-8" />
            <span className="text-2xl font-bold">Matheus o Transcritor</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isSignUp ? "Crie sua conta" : "Faça login para continuar"}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
                          {isSignUp 
                ? "Cadastre-se para usar a ferramenta de transcrição"
                : "Acesse sua conta para usar a ferramenta de transcrição"
              }
          </p>
        </div>

        {/* Login com Google */}
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full py-2 px-4 font-semibold border-2 hover:bg-gray-50"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Conectando com Google...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Ou</span>
            </div>
          </div>
        </div>

        {/* Formulário de email/senha */}
        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              placeholder="Digite seu email"
              disabled={isLoading || isGoogleLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Digite sua senha"
                disabled={isLoading || isGoogleLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading || isGoogleLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={`text-sm text-center p-3 rounded-md ${
              error.includes('Cadastro realizado') 
                ? 'text-green-600 bg-green-50' 
                : 'text-red-600 bg-red-50'
            }`}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-2 px-4 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isSignUp ? "Cadastrando..." : "Entrando..."}
              </>
            ) : (
              isSignUp ? "Cadastrar" : "Entrar"
            )}
          </Button>
        </form>

        {/* Toggle entre Login e Cadastro */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
            disabled={isLoading || isGoogleLoading}
          >
            {isSignUp 
              ? "Já tem uma conta? Faça login"
              : "Não tem uma conta? Cadastre-se"
            }
          </button>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-400 text-center">
          <p>Debug: Abra o console do navegador (F12) para ver os logs</p>
        </div>
      </div>
    </div>
  );
} 