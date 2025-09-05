import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { verifyToken } from "@/app/lib/auth";
import { TYPES } from "tedious";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: "Token inválido" },
        { status: 401 }
      );
    }

    // Await params para Next.js 15
    const { id } = await params;

    // Validar que el ID sea un GUID válido
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(id)) {
      return NextResponse.json(
        { error: "ID de contacto inválido" },
        { status: 400 }
      );
    }

    // Verificar que el contacto existe
    const checkQuery = `
      SELECT id FROM numeros WHERE id = @param1
    `;
    const checkParams = [
      { type: TYPES.UniqueIdentifier, value: id }
    ];
    const existingContact = await executeQuery(checkQuery, checkParams);

    if (existingContact.length === 0) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar en orden correcto debido a las foreign keys
    // 1. Eliminar relaciones usuarios_numeros_rel
    const deleteRelQuery = `
      DELETE FROM usuarios_numeros_rel WHERE id_numero = @param1
    `;
    await executeQuery(deleteRelQuery, checkParams);

    // 2. Eliminar usuarios_numeros asociados (solo si no tienen otras relaciones)
    const deleteUsersQuery = `
      DELETE un FROM usuarios_numeros un
      LEFT JOIN usuarios_numeros_rel unr ON un.id = unr.id_usuario
      WHERE unr.id_usuario IS NULL
      AND un.id IN (
        SELECT DISTINCT unr2.id_usuario 
        FROM usuarios_numeros_rel unr2 
        WHERE unr2.id_numero = @param1
      )
    `;
    await executeQuery(deleteUsersQuery, checkParams);

    // 3. Eliminar el número
    const deleteNumberQuery = `
      DELETE FROM numeros WHERE id = @param1
    `;
    await executeQuery(deleteNumberQuery, checkParams);

    return NextResponse.json(
      { message: "Contacto eliminado exitosamente" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al eliminar contacto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}