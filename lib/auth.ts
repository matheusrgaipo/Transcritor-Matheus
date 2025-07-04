import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
};

export function isAuthenticated(): boolean {
  console.log("🔐 Verificando autenticação...");
  
  if (typeof window === "undefined") {
    console.log("❌ Executando no servidor (SSR)");
    return false;
  }
  
  const token = localStorage.getItem("authToken");
  console.log("🎫 Token recuperado:", token ? token.substring(0, 20) + "..." : "null");
  
  if (!token) {
    console.log("❌ Nenhum token encontrado");
    return false;
  }
  
  console.log("✅ Token encontrado, considerando autenticado");
  return true;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  }
} 