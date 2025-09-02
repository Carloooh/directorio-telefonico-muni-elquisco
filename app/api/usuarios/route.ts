import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { hashPassword } from "@/app/lib/auth";
import {
  sendUserRegister,
  sendAccountStatusChange,
  sendUserRoleChanged,
  sendUserEmailChanged,
  sendPasswordChangedByAdmin,
} from "@/app/lib/email";

interface CreateUserRequest {
  nombre: string;
  usuario: string;
  email: string;
  rol: string;
  rut: string; // Agregar campo RUT
  id_direccion: string;
  id_area: string;
}

interface UpdateUserRequest {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  rut: string; // Agregar campo RUT
  id_direccion: string;
  id_area: string;
}

interface UserFromDB {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  estado: string;
  email: string;
  rut: string;
  id_direccion: string;
  id_area: string;
  nombre_area: string;
  nombre_direccion: string;
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

// GET - Obtener todos los usuarios
export async function GET() {
  try {
    const query = `
      SELECT u.id, u.nombre, u.usuario, u.rol, u.estado, u.email, u.rut, 
             u.id_direccion, u.id_area, a.nombre as nombre_area, d.nombre as nombre_direccion
      FROM usuarios u
      LEFT JOIN areas a ON u.id_area = a.id
      LEFT JOIN direcciones d ON u.id_direccion = d.id
      ORDER BY u.nombre
    `;

    const users = await executeQuery<UserFromDB>(query);

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    const { nombre, usuario, email, rol, rut, id_direccion, id_area } = body; // Incluir rut

    // Validaciones
    if (!nombre || !usuario || !email || !rol || !rut) {
      // Validar rut
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validar rol
    const rolesValidos = ["Administrador", "Revisor", "Editor", "Supervisor"];
    if (!rolesValidos.includes(rol)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const checkUserQuery = `
      SELECT COUNT(*) as count
      FROM usuarios 
      WHERE usuario = @param1 OR email = @param2 OR rut = @param3
    `;

    const checkParams = [
      { type: TYPES.VarChar, value: usuario },
      { type: TYPES.VarChar, value: email },
      { type: TYPES.VarChar, value: rut }, // Verificar RUT único
    ];

    const existingUsers = await executeQuery<{ count: number }>(
      checkUserQuery,
      checkParams
    );

    if (existingUsers[0].count > 0) {
      return NextResponse.json(
        { error: "El usuario, email o RUT ya existe" },
        { status: 409 }
      );
    }

    // Generar contraseña temporal
    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Insertar usuario
    const insertQuery = `
      INSERT INTO usuarios (nombre, usuario, rol, estado, email, rut, contraseña, id_direccion, id_area)
      VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)
    `;

    const insertParams = [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.VarChar, value: usuario },
      { type: TYPES.VarChar, value: rol },
      { type: TYPES.VarChar, value: "Activa" },
      { type: TYPES.VarChar, value: email },
      { type: TYPES.VarChar, value: rut }, // Incluir RUT
      { type: TYPES.VarChar, value: hashedPassword },
      { type: TYPES.VarChar, value: id_direccion },
      { type: TYPES.VarChar, value: id_area },
    ];

    await executeQuery(insertQuery, insertParams);

    // Enviar email con credenciales
    try {
      await sendUserRegister(email, nombre, usuario, rol, tempPassword);
    } catch (emailError) {
      console.error("Error al enviar email:", emailError);
      // No fallar la creación del usuario si el email falla
    }

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateUserRequest = await request.json();
    const { id, nombre, email, rol, estado, rut, id_direccion, id_area } = body;

    // Validaciones
    if (
      !id ||
      !nombre ||
      !email ||
      !rol ||
      !estado ||
      !rut ||
      !id_direccion ||
      !id_area
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validar rol
    const rolesValidos = ["Administrador", "Revisor", "Editor", "Supervisor"];
    if (!rolesValidos.includes(rol)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    // Validar estado
    const estadosValidos = ["Activa", "Desactivada", "Suspendida"];
    if (!estadosValidos.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    // Obtener datos actuales del usuario
    const getCurrentUserQuery = `
      SELECT nombre, email, rol, estado, rut, id_direccion, id_area
      FROM usuarios 
      WHERE id = @param1
    `;

    const getCurrentUserParams = [{ type: TYPES.UniqueIdentifier, value: id }];

    const currentUsers = await executeQuery<UserFromDB>(
      getCurrentUserQuery,
      getCurrentUserParams
    );

    if (currentUsers.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const currentUser = currentUsers[0];

    // Verificar si el email o RUT ya existe en otro usuario (CORREGIDO)
    // Solo verificar si el email o RUT han cambiado
    if (email !== currentUser.email || rut !== currentUser.rut) {
      const checkEmailQuery = `
        SELECT COUNT(*) as count
        FROM usuarios 
        WHERE (email = @param1 OR rut = @param2) AND id != @param3
      `;

      const checkEmailParams = [
        { type: TYPES.VarChar, value: email },
        { type: TYPES.VarChar, value: rut },
        { type: TYPES.UniqueIdentifier, value: id },
      ];

      const existingEmails = await executeQuery<{ count: number }>(
        checkEmailQuery,
        checkEmailParams
      );

      if (existingEmails[0].count > 0) {
        return NextResponse.json(
          { error: "El email o RUT ya está en uso por otro usuario" },
          { status: 409 }
        );
      }
    }

    // Actualizar usuario
    const updateQuery = `
      UPDATE usuarios 
      SET nombre = @param1, email = @param2, rol = @param3, estado = @param4, rut = @param5, id_direccion = @param6, id_area = @param7
      WHERE id = @param8
    `;

    const updateParams = [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.VarChar, value: email },
      { type: TYPES.VarChar, value: rol },
      { type: TYPES.VarChar, value: estado },
      { type: TYPES.VarChar, value: rut },
      { type: TYPES.VarChar, value: id_direccion },
      { type: TYPES.VarChar, value: id_area },
      { type: TYPES.UniqueIdentifier, value: id },
    ];

    await executeQuery(updateQuery, updateParams);

    // Enviar notificaciones por email si hay cambios relevantes
    try {
      if (currentUser.estado !== estado) {
        await sendAccountStatusChange(
          email,
          nombre,
          estado as "Activa" | "Desactivada" | "Suspendida"
        );
      }

      if (currentUser.rol !== rol) {
        await sendUserRoleChanged(email, nombre, rol);
      }

      if (currentUser.email !== email) {
        await sendUserEmailChanged(email, nombre);
      }
    } catch (emailError) {
      console.error("Error al enviar email de notificación:", emailError);
      // No fallar la actualización si el email falla
    }

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe
    const checkUserQuery = `
      SELECT COUNT(*) as count
      FROM usuarios 
      WHERE id = @param1
    `;

    const checkUserParams = [{ type: TYPES.UniqueIdentifier, value: id }];

    const existingUsers = await executeQuery<{ count: number }>(
      checkUserQuery,
      checkUserParams
    );

    if (existingUsers[0].count === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar usuario (CASCADE eliminará los permisos automáticamente)
    const deleteQuery = `
      DELETE FROM usuarios 
      WHERE id = @param1
    `;

    const deleteParams = [{ type: TYPES.UniqueIdentifier, value: id }];

    await executeQuery(deleteQuery, deleteParams);

    return NextResponse.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
