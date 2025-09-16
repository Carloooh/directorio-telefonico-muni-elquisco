import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { verifyToken, UserPayload } from "@/app/lib/auth";

interface Cargo {
  id: string;
  nombre: string;
}

// GET - Obtener todas los cargos
export async function GET(request: NextRequest) {
  try {
    // Consulta principal para obtener cargos
    const query = `
      SELECT id, nombre
      FROM cargo
      ORDER BY nombre
    `;

    const [cargos] = await Promise.all([executeQuery<Cargo>(query, [])]);

    return NextResponse.json({
      success: true,
      cargos: cargos,
    });
  } catch (error) {
    console.error("Error al obtener cargos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo cargo
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

    // Verificar si ya existe un cargo  con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM cargo
      WHERE nombre = @param1
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { type: TYPES.VarChar, value: nombre },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe un cargo con este nombre" },
        { status: 400 }
      );
    }

    // Crear nuevo cargo
    const insertQuery = `
      INSERT INTO cargo (nombre)
      OUTPUT INSERTED.id, INSERTED.nombre
      VALUES (@param1)
    `;

    const resultado = await executeQuery<Cargo>(insertQuery, [
      { type: TYPES.VarChar, value: nombre },
    ]);

    return NextResponse.json({
      success: true,
      cargo: resultado[0],
      message: "Cargo creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear cargo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar cargo
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

    // Verificar si ya existe otro cargo con el mismo nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM cargo
      WHERE nombre = @param1 AND id != @param2
    `;

    const checkResult = await executeQuery<{ count: number }>(checkQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (checkResult[0].count > 0) {
      return NextResponse.json(
        { error: "Ya existe un cargo con este nombre" },
        { status: 400 }
      );
    }

    // Actualizar cargo
    const updateQuery = `
      UPDATE cargo
      SET nombre = @param1
      OUTPUT INSERTED.id, INSERTED.nombre
      WHERE id = @param2
    `;

    const resultado = await executeQuery<Cargo>(updateQuery, [
      { type: TYPES.VarChar, value: nombre },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "Cargo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cargo: resultado[0],
      message: "Cargo actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar cargo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar cargo
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
        { error: "ID de cargo es requerido" },
        { status: 400 }
      );
    }

    // Eliminar cargo
    const deleteQuery = `
      DELETE FROM cargo
      OUTPUT DELETED.id, DELETED.nombre
      WHERE id = @param1
    `;

    const resultado = await executeQuery<Cargo>(deleteQuery, [
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (resultado.length === 0) {
      return NextResponse.json(
        { error: "Cargo no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Cargo eliminado exitosamente",
        cargo: resultado[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al eliminar cargo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
