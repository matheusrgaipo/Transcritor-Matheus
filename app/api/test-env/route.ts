import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    // NextAuth
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "✅ Definida" : "❌ Não definida",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ Definida" : "❌ Não definida",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "✅ Definida" : "❌ Não definida",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "✅ Definida" : "❌ Não definida",
    JWT_SECRET: process.env.JWT_SECRET ? "✅ Definida" : "❌ Não definida",
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Definida" : "❌ Não definida",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Definida" : "❌ Não definida",
  };

  // Mostrar apenas os primeiros e últimos caracteres para verificação
  const safeValues = {
    // NextAuth
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "undefined",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 
      process.env.NEXTAUTH_SECRET.substring(0, 10) + "..." + process.env.NEXTAUTH_SECRET.slice(-5) : 
      "undefined",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 
      process.env.GOOGLE_CLIENT_ID.substring(0, 15) + "..." + process.env.GOOGLE_CLIENT_ID.slice(-10) : 
      "undefined",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 
      process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + "..." + process.env.GOOGLE_CLIENT_SECRET.slice(-5) : 
      "undefined",
      
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + "..." + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-10) : 
      "undefined",
  };

  // Verificar se o Supabase está configurado corretamente
  const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return NextResponse.json({
    status: envVars,
    preview: safeValues,
    supabase: {
      configured: supabaseConfigured ? "✅ Configurado" : "❌ Não configurado",
      url_valid: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co') ? "✅ Válida" : "❌ Inválida",
      key_valid: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') ? "✅ Válida" : "❌ Inválida",
    },
    timestamp: new Date().toISOString(),
  });
} 