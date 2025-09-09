import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { verifyToken, UserPayload } from "@/app/lib/auth";

interface ubicacion {
  id: string;
  nombre: string;
}

// GET - Obtener todas las ubicaciones
export async function GET(request: NextRequest) {
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

    if (!userPayload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Consulta principal para obtener ubicacion
    const query = `
      SELECT id, nombre
      FROM ubicacion
      ORDER BY nombre
    `;

    const [ubicaciones] = await Promise.all([
      executeQuery<ubicacion>(query, []),
    ]);

    return NextResponse.json({
      success: true,
      ubicaciones: ubicaciones,
    });
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva ubicacion
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

    const { nombre } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una ubicacion con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM ubicacion
      WHERE nombre = @param1
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { type: TYPES.VarChar, value: nombre },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe un ubicacion con este nombre" },
        { status: 400 }
      );
    }

    // Crear nueva ubicacion
    const insertQuery = `
      INSERT INTO ubicacion (nombre)
      OUTPUT INSERTED.id, INSERTED.nombre
      VALUES (@param1)
    `;

    const resultado = await executeQuery<ubicacion>(insertQuery, [
      { type: TYPES.VarChar, value: nombre },
    ]);

    return NextResponse.json({
      success: true,
      ubicacion: resultado[0],
      message: "ubicacion creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear ubicacion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar ubicacion
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

    const { id, nombre } = await request.json();

    if (!id || !nombre) {
      return NextResponse.json(
        { error: "ID y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe otra ubicacion con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM ubicacion
      WHERE nombre = @param1 AND id != @param2
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe una ubicacion con este nombre" },
        { status: 400 }
      );
    }

    // Actualizar ubicacion
    const updateQuery = `
      UPDATE ubicacion
      SET nombre = @param1
      OUTPUT INSERTED.id, INSERTED.nombre
      WHERE id = @param2
    `;

    const resultado = await executeQuery<ubicacion>(updateQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "ubicacion no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ubicacion: resultado[0],
      message: "ubicacion actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar ubicacion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar ubicacion
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
        { error: "ID de ubicacion es requerido" },
        { status: 400 }
      );
    }

    // Eliminar ubicacion
    const deleteQuery = `
      DELETE FROM ubicacion
      OUTPUT DELETED.id, DELETED.nombre
      WHERE id = @param1
    `;

    const resultado = await executeQuery<ubicacion>(deleteQuery, [
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "ubicacion no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ubicacion eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar ubicacion:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
