import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { hashPassword } from "@/app/lib/auth";
import { sendPasswordChangedByAdmin } from "@/app/lib/email";

interface ChangePasswordRequest {
  userId: string;
}

interface UserFromDB {
  id: string;
  nombre: string;
  usuario: string;
  email: string;
}

// Función para generar contraseña temporal
function generateTempPassword(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST - Cambiar contraseña de usuario
export async function POST(request: NextRequest) {
  try {
    const body: ChangePasswordRequest = await request.json();
    const { userId } = body;

    // Validaciones
    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const getUserQuery = `
      SELECT id, nombre, usuario, email
      FROM usuarios 
      WHERE id = @param1
    `;

    const getUserParams = [{ type: TYPES.UniqueIdentifier, value: userId }];

    const users = await executeQuery<UserFromDB>(getUserQuery, getUserParams);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Generar nueva contraseña temporal
    const newPassword = generateTempPassword();
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña en la base de datos
    const updatePasswordQuery = `
      UPDATE usuarios 
      SET contraseña = @param1
      WHERE id = @param2
    `;

    const updatePasswordParams = [
      { type: TYPES.VarChar, value: hashedPassword },
      { type: TYPES.UniqueIdentifier, value: userId },
    ];

    await executeQuery(updatePasswordQuery, updatePasswordParams);

    // Enviar email con la nueva contraseña
    try {
      await sendPasswordChangedByAdmin(
        user.email,
        user.nombre,
        user.usuario,
        newPassword
      );
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar el cambio de contraseña si el email falla
    }

    return NextResponse.json({
      success: true,
      message:
        "Contraseña cambiada exitosamente. Se ha enviado un email al usuario con la nueva contraseña.",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
