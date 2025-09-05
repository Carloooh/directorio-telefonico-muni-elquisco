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
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Validar GUID
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar que el contacto existe
    const checkContactQuery =
      "SELECT COUNT(*) as count FROM numeros WHERE id = @param1";
    const existingContact = await executeQuery<{ count: number }>(
      checkContactQuery,
      [{ type: TYPES.UniqueIdentifier, value: id }]
    );

    if (existingContact[0].count === 0) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar relaciones primero
    const deleteRelationsQuery =
      "DELETE FROM usuarios_numeros_rel WHERE id_numero = @param1";
    await executeQuery(deleteRelationsQuery, [
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    // Eliminar usuarios huérfanos
    const deleteOrphanUsersQuery = `
      DELETE FROM usuarios_numeros 
      WHERE id NOT IN (SELECT DISTINCT id_usuario FROM usuarios_numeros_rel WHERE id_usuario IS NOT NULL)
    `;
    await executeQuery(deleteOrphanUsersQuery);

    // Eliminar el número
    const deleteNumberQuery = "DELETE FROM numeros WHERE id = @param1";
    await executeQuery(deleteNumberQuery, [
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    return NextResponse.json({
      success: true,
      message: "Contacto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando contacto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido o expirado" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { numero, tipo, direccion, unidad, ubicacion, usuarios } = body;

    // Validar GUID
    const guidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    // Verificar que el contacto existe
    const checkContactQuery =
      "SELECT COUNT(*) as count FROM numeros WHERE id = @param1";
    const existingContact = await executeQuery<{ count: number }>(
      checkContactQuery,
      [{ type: TYPES.UniqueIdentifier, value: id }]
    );

    if (existingContact[0].count === 0) {
      return NextResponse.json(
        { error: "Contacto no encontrado" },
        { status: 404 }
      );
    }

    // Validar campos requeridos
    if (!numero || !tipo) {
      return NextResponse.json(
        { error: "Número y tipo son campos requeridos" },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!["Fijo", "Móvil"].includes(tipo)) {
      return NextResponse.json(
        { error: "El tipo debe ser 'Fijo' o 'Móvil'" },
        { status: 400 }
      );
    }

    // Validar formato de número
    const numeroLimpio = numero.replace(/[^0-9]/g, "");
    if (tipo === "Móvil" && numeroLimpio.length !== 8) {
      return NextResponse.json(
        { error: "El número móvil debe tener exactamente 8 dígitos" },
        { status: 400 }
      );
    }
    if (tipo === "Fijo" && numeroLimpio.length !== 4) {
      return NextResponse.json(
        { error: "El número fijo debe tener exactamente 4 dígitos" },
        { status: 400 }
      );
    }

    // Verificar si el número ya existe (excluyendo el contacto actual)
    const checkExistingQuery =
      "SELECT id FROM numeros WHERE numero = @param1 AND id != @param2";
    const existingNumber = await executeQuery(checkExistingQuery, [
      { type: TYPES.VarChar, value: numeroLimpio },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (existingNumber.length > 0) {
      return NextResponse.json(
        { error: `El número ${numeroLimpio} ya está registrado` },
        { status: 409 }
      );
    }

    // Actualizar información del número
    const updateNumberQuery = `
      UPDATE numeros 
      SET numero = @param1, tipo = @param2, direccion = @param3, 
          unidad = @param4, ubicacion = @param5
      WHERE id = @param6
    `;

    await executeQuery(updateNumberQuery, [
      { type: TYPES.VarChar, value: numeroLimpio },
      { type: TYPES.VarChar, value: tipo },
      { type: TYPES.VarChar, value: direccion || null },
      { type: TYPES.VarChar, value: unidad || null },
      { type: TYPES.VarChar, value: ubicacion || null },
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    // Eliminar relaciones existentes
    const deleteRelationsQuery =
      "DELETE FROM usuarios_numeros_rel WHERE id_numero = @param1";
    await executeQuery(deleteRelationsQuery, [
      { type: TYPES.UniqueIdentifier, value: id },
    ]);

    // Eliminar usuarios huérfanos
    const deleteOrphanUsersQuery = `
      DELETE FROM usuarios_numeros 
      WHERE id NOT IN (SELECT DISTINCT id_usuario FROM usuarios_numeros_rel WHERE id_usuario IS NOT NULL)
    `;
    await executeQuery(deleteOrphanUsersQuery);

    // Insertar nuevos usuarios y crear relaciones
    let usuariosActualizados = 0;
    if (usuarios && usuarios.length > 0) {
      for (const usuario of usuarios) {
        if (usuario.nombre && usuario.nombre.trim()) {
          // Insertar usuario
          const insertUserQuery = `
            INSERT INTO usuarios_numeros (nombre, cargo)
            VALUES (@param1, @param2)
          `;

          await executeQuery(insertUserQuery, [
            { type: TYPES.VarChar, value: usuario.nombre.trim() },
            { type: TYPES.VarChar, value: usuario.cargo || null },
          ]);

          // Obtener el ID del usuario recién insertado
          const getUserIdQuery = `
            SELECT TOP 1 id FROM usuarios_numeros 
            WHERE nombre = @param1 
            ORDER BY id DESC
          `;
          const userIdResult = await executeQuery(getUserIdQuery, [
            { type: TYPES.VarChar, value: usuario.nombre.trim() },
          ]);

          if (userIdResult.length > 0) {
            // Crear relación
            const insertRelationQuery = `
              INSERT INTO usuarios_numeros_rel (id_usuario, id_numero)
              VALUES (@param1, @param2)
            `;

            await executeQuery(insertRelationQuery, [
              { type: TYPES.UniqueIdentifier, value: userIdResult[0].id },
              { type: TYPES.UniqueIdentifier, value: id },
            ]);

            usuariosActualizados++;
          }
        }
      }
    }

    return NextResponse.json({
      message: "Contacto actualizado exitosamente",
      contactoId: id,
      usuariosActualizados,
    });
  } catch (error) {
    console.error("Error actualizando contacto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
