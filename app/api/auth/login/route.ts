import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

// Credenciais simples para teste (em produção, usar banco de dados)
const VALID_CREDENTIALS = {
  username: "admin",
  password: "123456"
};

const JWT_SECRET = process.env.JWT_SECRET || "sua-chave-secreta-aqui";

export async function POST(req: NextRequest) {
  console.log("🔐 API de login chamada");
  
  try {
    const { username, password } = await req.json();
    console.log("📥 Credenciais recebidas:", { username, password });
    console.log("🔍 Credenciais válidas:", VALID_CREDENTIALS);

    // Validar credenciais
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      console.log("✅ Credenciais válidas! Gerando token...");
      
      // Gerar token JWT
      const token = sign(
        { username, loginTime: Date.now() },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      console.log("🎫 Token gerado:", token.substring(0, 20) + "...");

      const response = {
        success: true,
        token,
        message: "Login realizado com sucesso"
      };

      console.log("📤 Enviando resposta de sucesso");
      return NextResponse.json(response);
    } else {
      console.log("❌ Credenciais inválidas");
      console.log("- Username match:", username === VALID_CREDENTIALS.username);
      console.log("- Password match:", password === VALID_CREDENTIALS.password);
      
      return NextResponse.json(
        { success: false, message: "Usuário ou senha incorretos" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("🚨 Erro na API de login:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
} 