import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { hashPassword, comparePassword } from "@/app/lib/auth";

interface ChangeOwnPasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

interface UserFromDB {
  id: string;
  nombre: string;
  email: string;
  contraseña: string;
}

// POST - Cambiar contraseña propia
export async function POST(request: NextRequest) {
  try {
    const body: ChangeOwnPasswordRequest = await request.json();
    const { userId, currentPassword, newPassword } = body;

    // Validaciones
    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar longitud de nueva contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La nueva contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const getUserQuery = `
      SELECT id, nombre, email, contraseña
      FROM usuarios 
      WHERE id = @param1 AND estado = 'Activa'
    `;

    const getUserParams = [{ type: TYPES.UniqueIdentifier, value: userId }];

    const users = await executeQuery<UserFromDB>(getUserQuery, getUserParams);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado o inactivo" },
        { status: 404 }
      );
    }

    const user = users[0];

    // Verificar contraseña actual
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      user.contraseña
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña actual es incorrecta" },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar contraseña en la base de datos
    const updatePasswordQuery = `
      UPDATE usuarios 
      SET contraseña = @param1
      WHERE id = @param2
    `;

    const updatePasswordParams = [
      { type: TYPES.VarChar, value: hashedNewPassword },
      { type: TYPES.UniqueIdentifier, value: userId },
    ];

    await executeQuery(updatePasswordQuery, updatePasswordParams);

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña propia:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
