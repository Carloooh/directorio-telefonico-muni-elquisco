import { NextRequest, NextResponse } from "next/server";
import { verifyToken, isTokenExpired } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    if (isTokenExpired(token)) {
      return NextResponse.json({ error: "Token expirado" }, { status: 401 });
    }

    const userPayload = verifyToken(token);

    if (!userPayload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: userPayload,
    });
  } catch (error) {
    console.error("Error verificando token:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
