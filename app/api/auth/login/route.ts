import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { comparePassword, generateToken, UserPayload } from "@/app/lib/auth";

interface LoginRequest {
  usuario: string;
  contraseña: string;
}

interface UserFromDB {
  id: string;
  usuario: string;
  contraseña: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { usuario, contraseña } = body;

    if (!usuario || !contraseña) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario en la base de datos
    const query = `
      SELECT id, usuario, contraseña, nombre, email, rol, estado
      FROM usuarios 
      WHERE usuario = @param1
    `;

    const params = [{ type: TYPES.VarChar, value: usuario }];

    const users = await executeQuery<UserFromDB>(query, params);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar que el usuario esté activo
    if (user.estado !== "Activa") {
      return NextResponse.json(
        { error: "Usuario inactivo" },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(contraseña, user.contraseña);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Crear payload para el token
    const userPayload: UserPayload = {
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol || "Usuario",
      email: user.email,
    };

    // Generar token
    const token = generateToken(userPayload);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol || "Usuario",
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
