import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { verifyToken } from "@/app/lib/auth";
import { TYPES } from "tedious";

export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT 
        n.id,
       CASE
    WHEN n.tipo = 'Móvil' THEN CONCAT('+56', n.numero)
    ELSE n.numero
  END AS numero,
        n.tipo,
        n.direccion,
        n.unidad,
        n.ubicacion,
        un.nombre,
        un.cargo
      FROM numeros n
      LEFT JOIN usuarios_numeros_rel unr ON n.id = unr.id_numero
      LEFT JOIN usuarios_numeros un ON unr.id_usuario = un.id
      ORDER BY n.tipo, n.numero
    `;

    const results = await executeQuery(query);

    // Agrupar resultados por número para manejar múltiples usuarios por número
    const contactsMap = new Map();

    results.forEach((row: any) => {
      const contactId = row.id;

      if (!contactsMap.has(contactId)) {
        contactsMap.set(contactId, {
          id: row.id,
          anexo: row.tipo === "Fijo" ? row.numero : "",
          numero: row.tipo === "Movil" ? row.numero : row.numero,
          tipo: row.tipo,
          nombre: row.nombre || "",
          direccion: row.direccion || "",
          unidad: row.unidad || "",
          cargo: row.cargo || "",
          ubicacion: row.ubicacion || "",
          additionalContacts: [],
        });
      } else {
        // Si ya existe el contacto, agregar usuario adicional
        const existingContact = contactsMap.get(contactId);
        if (row.nombre && row.nombre !== existingContact.nombre) {
          existingContact.additionalContacts.push({
            nombre: row.nombre,
            unidad: row.unidad || "",
            cargo: row.cargo || "",
            direccion: row.direccion || "",
            ubicacion: row.ubicacion || "",
          });
        }
      }
    });

    const contacts = Array.from(contactsMap.values());

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar sesión
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

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    const { numero, tipo, direccion, unidad, ubicacion, usuarios } = body;

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

    // Validar formato de número - EXACTAMENTE 4 dígitos para fijo, 8 para móvil
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

    // Verificar si el número ya existe
    const checkQuery = "SELECT id FROM numeros WHERE numero = @param1";
    const existingNumber = await executeQuery(checkQuery, [
      { type: TYPES.VarChar, value: numeroLimpio },
    ]);

    if (existingNumber.length > 0) {
      return NextResponse.json(
        { error: "Este número ya existe en el directorio" },
        { status: 409 }
      );
    }

    // Insertar número en la tabla numeros
    const insertNumberQuery = `
      INSERT INTO numeros (numero, tipo, direccion, unidad, ubicacion)
      VALUES (@param1, @param2, @param3, @param4, @param5)
    `;

    await executeQuery(insertNumberQuery, [
      { type: TYPES.VarChar, value: numeroLimpio },
      { type: TYPES.VarChar, value: tipo },
      { type: TYPES.VarChar, value: direccion || null },
      { type: TYPES.VarChar, value: unidad || null },
      { type: TYPES.VarChar, value: ubicacion || null },
    ]);

    // Obtener el ID del número insertado
    const getNumberIdQuery = "SELECT id FROM numeros WHERE numero = @param1";
    const numberIdResult = await executeQuery(getNumberIdQuery, [
      { type: TYPES.VarChar, value: numeroLimpio },
    ]);

    if (numberIdResult.length === 0) {
      throw new Error("No se pudo obtener el ID del número insertado");
    }

    const numeroId = numberIdResult[0].id;

    // Insertar TODOS los usuarios y sus relaciones
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
              { type: TYPES.UniqueIdentifier, value: numeroId },
            ]);
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: "Contacto añadido exitosamente",
        numero: numeroLimpio,
        tipo: tipo,
        usuariosCreados: usuarios?.length || 0,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding contact:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
