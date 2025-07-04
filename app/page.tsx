"use client";
import { useState, ChangeEvent, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, Loader2, FileIcon, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user, loading, signOut } = useSupabase();

  // Verificar autenticação no carregamento
  useEffect(() => {
    console.log("🏠 Página principal carregada, verificando autenticação...");
    console.log("👤 Usuário:", user);
    console.log("⏳ Carregando:", loading);
    
    if (!loading) {
      if (!user) {
        console.log("❌ Usuário não autenticado, redirecionando para login...");
        // Aguardar um pouco antes de redirecionar para evitar flashes
        setTimeout(() => {
          router.push("/login");
        }, 100);
      } else {
        console.log("✅ Usuário autenticado, carregando página...");
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setTranscription("");
    setError(null);
    setProgress(0);
    setIsProcessing(false);
    setProcessingStep("");
  }

  function handleUploadAreaClick() {
    fileInputRef.current?.click();
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    setTranscription("");
    setProgress(10);
    setProcessingStep("Convertendo arquivo...");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setProgress(30);
      setProcessingStep("Processando com FFmpeg...");

      const response = await fetch("/api/process-video", {
        method: "POST",
        body: formData,
      });

      setProgress(70);
      setProcessingStep("Transcrevendo áudio...");

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro no processamento");

      setTranscription(data.transcription);
      setProgress(100);
      setProcessingStep("Concluído!");
    } catch (err: any) {
      setError(err.message);
      setProgress(0);
      setProcessingStep("");
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, não renderizar nada (o useEffect vai redirecionar)
  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center px-4 py-8">
      <header className="w-full flex items-center justify-between mb-8 max-w-2xl">
        <div className="flex items-center gap-2 text-xl font-semibold">
          <UploadCloud className="w-6 h-6" />
          <span>Matheus o Transcritor</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Informações do usuário */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={user.user_metadata?.full_name || ""} />
              <AvatarFallback>
                {user.user_metadata?.full_name ? (
                  user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
                ) : user.email ? (
                  user.email[0].toUpperCase()
                ) : (
                  <User className="w-4 h-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>
      <section className="w-full max-w-2xl flex flex-col items-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Adicione um arquivo para transcrição</h1>
        
        {/* Área de Upload Melhorada */}
        <div 
          className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center py-12 px-4 mb-8"
          onClick={handleUploadAreaClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          
          {selectedFile ? (
            <div className="flex flex-col items-center">
              <FileIcon className="w-12 h-12 text-blue-500 mb-2" />
              <p className="text-base font-medium text-gray-700 mb-1">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                type="button"
                variant="default"
                className="px-6 py-2 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload();
                }}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isProcessing ? "Processando..." : "Processar & Transcrever"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="mb-2 text-base font-medium text-gray-700">Clique aqui para adicionar um arquivo</p>
              <p className="mb-6 text-sm text-gray-500">Aceitamos apenas arquivos de vídeo e áudio.</p>
              <Button type="button" variant="secondary" className="px-6 py-2 font-semibold pointer-events-none">
                Selecionar arquivo
              </Button>
            </div>
          )}
        </div>

        <div className="w-full flex flex-col gap-2 mb-8">
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
              <Loader2 className="w-4 h-4 animate-spin" /> {processingStep}
            </div>
          )}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {isProcessing ? "Processando vídeo/áudio e transcrevendo..." : "Isso pode levar alguns minutos"}
          </span>
          {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
        </div>
        <div className="w-full">
          <label className="block text-base font-medium mb-2">Transcrição</label>
          <Textarea
            className="w-full min-h-[100px] resize-none"
            value={transcription}
            placeholder=""
            readOnly
          />
        </div>
      </section>
    </main>
  );
}
