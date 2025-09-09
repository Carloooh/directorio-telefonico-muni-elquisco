import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { verifyToken, UserPayload } from "@/app/lib/auth";

interface Unidad {
  id: string;
  nombre: string;
}

// GET - Obtener todas las unidades
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

    // Consulta principal para obtener unidad
    const query = `
      SELECT id, nombre
      FROM unidad
      ORDER BY nombre
    `;

    const [unidades] = await Promise.all([executeQuery<Unidad>(query, [])]);

    return NextResponse.json({
      success: true,
      unidades: unidades,
    });
  } catch (error) {
    console.error("Error al obtener unidades:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva unidad
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

    // Verificar si ya existe una unidad con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM unidad
      WHERE unidad = @unidad
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { name: "nombre", type: TYPES.VarChar, value: nombre },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe un unidad con este nombre" },
        { status: 400 }
      );
    }

    // Crear nueva unidad
    const insertQuery = `
      INSERT INTO unidad (nombre)
      OUTPUT INSERTED.id, INSERTED.nombre
      VALUES (@nombre)
    `;

    const resultado = await executeQuery<Unidad>(insertQuery, [
      { name: "nombre", type: TYPES.VarChar, value: nombre },
    ]);

    return NextResponse.json({
      success: true,
      unidad: resultado[0],
      message: "Unidad creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar unidad
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

    // Verificar si ya existe otra unidad con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM unidad
      WHERE nombre = @nombre AND id != @id
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { name: "nombre", type: TYPES.VarChar, value: nombre },
      { name: "id", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe una unidad con este nombre" },
        { status: 400 }
      );
    }

    // Actualizar unidad
    const updateQuery = `
      UPDATE unidad
      SET nombre = @nombre
      OUTPUT INSERTED.id, INSERTED.nombre
      WHERE id = @id
    `;

    const resultado = await executeQuery<Unidad>(updateQuery, [
      { name: "nombre", type: TYPES.VarChar, value: nombre },
      { name: "id", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      unidad: resultado[0],
      message: "Unidad actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar unidad
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
        { error: "ID de unidad es requerido" },
        { status: 400 }
      );
    }

    // Eliminar unidad
    const deleteQuery = `
      DELETE FROM unidad
      OUTPUT DELETED.id, DELETED.nombre
      WHERE id = @id
    `;

    const resultado = await executeQuery<Unidad>(deleteQuery, [
      { name: "id", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "Unidad no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unidad eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar unidad:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
