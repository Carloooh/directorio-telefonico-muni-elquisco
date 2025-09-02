import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import {
  sendPasswordResetCode,
  sendPasswordResetConfirmation,
} from "@/app/lib/email";
import { hashPassword } from "@/app/lib/auth";

interface ResetPasswordRequest {
  email: string;
}

interface ConfirmResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

interface UserFromDB {
  id: string;
  nombre: string;
  email: string;
}

// Función para generar código de 6 dígitos
function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST: Solicitar restablecimiento de contraseña
export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Verificar si el usuario existe y está activo
    const checkUserQuery = `
      SELECT id, nombre, email
      FROM usuarios 
      WHERE email = @param1 AND estado = 'Activa'
    `;

    const checkParams = [{ type: TYPES.VarChar, value: email }];

    const users = await executeQuery<UserFromDB>(checkUserQuery, checkParams);

    if (users.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return NextResponse.json({
        success: true,
        message:
          "Si el email está registrado, recibirás un código de verificación",
      });
    }

    const user = users[0];

    // Generar código de restablecimiento
    const resetCode = generateResetCode();
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 15); // Expira en 15 minutos

    // Guardar código en la base de datos
    const updateCodeQuery = `
      UPDATE usuarios 
      SET codigo_temporal = @param1, fecha_expiracion_codigo_temporal = @param2
      WHERE email = @param3
    `;

    const updateParams = [
      { type: TYPES.VarChar, value: resetCode },
      { type: TYPES.DateTime2, value: expirationDate },
      { type: TYPES.VarChar, value: email },
    ];

    await executeQuery(updateCodeQuery, updateParams);

    // Enviar email con el código
    try {
      await sendPasswordResetCode(email, user.nombre, resetCode);
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      return NextResponse.json(
        { error: "Error al enviar el código de verificación" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Código de verificación enviado a tu email",
    });
  } catch (error) {
    console.error("Error en reset password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT: Confirmar restablecimiento con código
export async function PUT(request: NextRequest) {
  try {
    const body: ConfirmResetRequest = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, código y nueva contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Verificar código y que no haya expirado
    const verifyCodeQuery = `
      SELECT id, nombre, email
      FROM usuarios 
      WHERE email = @param1 
        AND codigo_temporal = @param2 
        AND fecha_expiracion_codigo_temporal > GETDATE()
        AND estado = 'Activa'
    `;

    const verifyParams = [
      { type: TYPES.VarChar, value: email },
      { type: TYPES.VarChar, value: code },
    ];

    const users = await executeQuery<UserFromDB>(verifyCodeQuery, verifyParams);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Código inválido o expirado" },
        { status: 400 }
      );
    }

    const user = users[0];

    // Hash de la nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar contraseña y limpiar código temporal
    const updatePasswordQuery = `
      UPDATE usuarios 
      SET contraseña = @param1, 
          codigo_temporal = NULL, 
          fecha_expiracion_codigo_temporal = NULL
      WHERE email = @param2
    `;

    const updatePasswordParams = [
      { type: TYPES.VarChar, value: hashedPassword },
      { type: TYPES.VarChar, value: email },
    ];

    await executeQuery(updatePasswordQuery, updatePasswordParams);

    // Enviar confirmación por email
    try {
      await sendPasswordResetConfirmation(email, user.nombre);
    } catch (emailError) {
      console.error("Error al enviar confirmación:", emailError);
      // No fallar si el email de confirmación falla
    }

    return NextResponse.json({
      success: true,
      message: "Contraseña restablecida exitosamente",
    });
  } catch (error) {
    console.error("Error en confirm reset:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
