import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";

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
