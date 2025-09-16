import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { verifyToken, UserPayload } from "@/app/lib/auth";

interface direccion {
  id: string;
  nombre: string;
  sigla?: string;
}

// GET - Obtener todas las direcciones
export async function GET(request: NextRequest) {
  try {
    // Consulta principal para obtener direccion
    const query = `
      SELECT id, nombre, sigla
      FROM direccion
      ORDER BY nombre
    `;

    const [direcciones] = await Promise.all([
      executeQuery<direccion>(query, []),
    ]);

    return NextResponse.json({
      success: true,
      direcciones: direcciones,
    });
  } catch (error) {
    console.error("Error al obtener direcciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva direccion
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userPayload: UserPayload | null = verifyToken(token);

    if (!userPayload || userPayload.rol !== "Administrador") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { nombre, sigla } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una direccion con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM direccion
      WHERE nombre = @param1
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { type: TYPES.VarChar, value: nombre },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe un direccion con este nombre" },
        { status: 400 }
      );
    }

    // Crear nueva direccion
    const insertQuery = `
      INSERT INTO direccion (nombre, sigla)
      OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.sigla
      VALUES (@param1, @param2)
    `;

    const resultado = await executeQuery<direccion>(insertQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.VarChar, value: sigla || null },
    ]);

    return NextResponse.json({
      success: true,
      direccion: resultado[0],
      message: "direccion creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear direccion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar direccion
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userPayload: UserPayload | null = verifyToken(token);

    if (!userPayload || userPayload.rol !== "Administrador") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { id, nombre, sigla } = await request.json();

    if (!id || !nombre) {
      return NextResponse.json(
        { error: "ID y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe otra direccion con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM direccion
      WHERE nombre = @param1 AND id != @param2
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe una direccion con este nombre" },
        { status: 400 }
      );
    }

    // Actualizar direccion
    const updateQuery = `
      UPDATE direccion
      SET nombre = @param1, sigla = @param2
      OUTPUT INSERTED.id, INSERTED.nombre, INSERTED.sigla
      WHERE id = @param3
    `;

    const resultado = await executeQuery<direccion>(updateQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.VarChar, value: sigla || null },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "direccion no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      direccion: resultado[0],
      message: "direccion actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar direccion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar direccion
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userPayload: UserPayload | null = verifyToken(token);

    if (!userPayload || userPayload.rol !== "Administrador") {
      return NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de direccion es requerido" },
        { status: 400 }
      );
    }

    // Eliminar direccion
    const deleteQuery = `
      DELETE FROM direccion
      OUTPUT DELETED.id, DELETED.nombre, DELETED.sigla
      WHERE id = @param1
    `;

    const resultado = await executeQuery<direccion>(deleteQuery, [
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "direccion no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "direccion eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar direccion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
