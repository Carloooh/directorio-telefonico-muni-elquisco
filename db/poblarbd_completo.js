import xlsx from "xlsx";
import { Connection, Request, TYPES } from "tedious";
import { randomUUID } from "crypto";

// Configuración de conexión a SQL Server
const config = {
  server: process.env.BD_HOST || "SRV-BDAPP.elquisco.cl",
  authentication: {
    type: "default",
    options: {
      userName: process.env.BD_USER || "D1rect0rIO_w3b_app",
      password: process.env.BD_PASSWORD || "D1rect0rIO_69banana-wev_420",
    },
  },
  options: {
    database: process.env.BD_NAME || "Directorio",
    encrypt: true,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: "TLSv1.2",
    },
  },
};

// Leer el archivo Excel
const workbook = xlsx.readFile(
  "C:/Users/cazocar/Documents/proyectos/directorio_venv/directorio/db/numeros.xlsx"
);

// Obtener ambas hojas
const sheetNameFijos = workbook.SheetNames[0]; // Hoja 1 (índice 0) - Teléfonos fijos
const sheetNameCelulares = workbook.SheetNames[1]; // Hoja 2 (índice 1) - Teléfonos celulares

const worksheetFijos = workbook.Sheets[sheetNameFijos];
const worksheetCelulares = workbook.Sheets[sheetNameCelulares];

const dataFijos = xlsx.utils.sheet_to_json(worksheetFijos, { header: 1 });
const dataCelulares = xlsx.utils.sheet_to_json(worksheetCelulares, {
  header: 1,
});

console.log(
  `Hoja de teléfonos fijos: ${sheetNameFijos} (${dataFijos.length} filas)`
);
console.log(
  `Hoja de teléfonos celulares: ${sheetNameCelulares} (${dataCelulares.length} filas)`
);

// Función para conectarse a SQL Server
function connectDB() {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    connection.on("connect", (err) => {
      if (err) {
        console.error("Error al conectar a la base de datos:", err);
        return reject(err);
      }
      resolve(connection);
    });
    connection.connect();
  });
}

// Función para ejecutar una consulta parametrizada
function execQuery(connection, query, parameters = []) {
  return new Promise((resolve, reject) => {
    const request = new Request(query, (err, rowCount) => {
      if (err) return reject(err);
      resolve(rowCount);
    });
    parameters.forEach((param) => {
      request.addParameter(param.name, param.type, param.value);
    });
    connection.execSql(request);
  });
}

// Función para formatear texto con límite de caracteres
function formatField(text, maxLength = 50) {
  if (!text || text === null || text === undefined) return null;
  const str = String(text).trim();
  return str.length > maxLength ? str.substring(0, maxLength) : str;
}

// Función para limpiar y normalizar número de celular
function cleanCellNumber(numero) {
  if (!numero) return null;

  // Convertir a string y eliminar espacios
  let numeroStr = String(numero).trim();

  // Eliminar todos los caracteres que no sean dígitos
  numeroStr = numeroStr.replace(/\D/g, "");

  // Si el número empieza con 56 (código de país de Chile), eliminarlo
  if (numeroStr.startsWith("56") && numeroStr.length > 9) {
    numeroStr = numeroStr.substring(2);
  }

  // Tomar solo los últimos 9 dígitos
  if (numeroStr.length >= 9) {
    numeroStr = numeroStr.slice(-9);
  }

  return numeroStr;
}

// Función para validar número de celular
function isValidCellNumber(numero) {
  const numeroLimpio = cleanCellNumber(numero);
  if (!numeroLimpio) return false;

  // Verificar que tenga exactamente 9 dígitos y empiece con 9
  return numeroLimpio.length === 9 && numeroLimpio.startsWith("9");
}

// Función para validar número de anexo (fijo)
function isValidFixedNumber(numero) {
  if (!numero) return false;
  const numeroStr = String(numero).trim();
  // Verificar que tenga al menos 1 carácter y solo contenga dígitos
  return numeroStr.length > 0 && /^\d+$/.test(numeroStr);
}

// Función para procesar teléfonos fijos
async function procesarTelefonosFijos(connection) {
  console.log("\n=== PROCESANDO TELÉFONOS FIJOS ===");

  if (dataFijos.length < 2) {
    console.log("No hay suficientes datos en la hoja de teléfonos fijos");
    return { processed: 0, skipped: 0 };
  }

  // Mapeo de columnas para teléfonos fijos
  const numeroAnexoIndex = 0; // Columna A - numero_anexo
  const direccionIndex = 17; // Columna R - direccion
  const unidadIndex = 18; // Columna S - unidad
  const ubicacionIndex = 19; // Columna T - ubicacion
  const usuario1Index = 20; // Columna U - USUARIO1
  const usuario2Index = 21; // Columna V - USUARIO2
  const usuario3Index = 22; // Columna W - USUARIO3

  console.log(`Mapeo de columnas para teléfonos fijos:`);
  console.log(`- numero_anexo: índice ${numeroAnexoIndex} (Columna A)`);
  console.log(`- direccion: índice ${direccionIndex} (Columna R)`);
  console.log(`- unidad: índice ${unidadIndex} (Columna S)`);
  console.log(`- ubicacion: índice ${ubicacionIndex} (Columna T)`);
  console.log(`- USUARIO1: índice ${usuario1Index} (Columna U)`);
  console.log(`- USUARIO2: índice ${usuario2Index} (Columna V)`);
  console.log(`- USUARIO3: índice ${usuario3Index} (Columna W)`);

  let processedCount = 0;
  let skippedCount = 0;

  // Procesar cada fila del Excel (empezar desde la fila 2, índice 1, para saltar encabezados)
  for (let i = 1; i < dataFijos.length; i++) {
    const row = dataFijos[i];

    if (!row || row.length === 0) {
      console.log(`Fila ${i + 1}: Vacía, omitiendo...`);
      skippedCount++;
      continue;
    }

    console.log(`Procesando fila ${i + 1} (Fijos)...`);

    // Extraer datos usando los índices de posición
    const numeroAnexo = row[numeroAnexoIndex];
    const direccion = row[direccionIndex];
    const unidad = row[unidadIndex];
    const ubicacion = row[ubicacionIndex];
    const usuario1 = row[usuario1Index];
    const usuario2 = row[usuario2Index];
    const usuario3 = row[usuario3Index];

    console.log(`  - Número Anexo: ${numeroAnexo}`);
    console.log(`  - Dirección: ${direccion}`);
    console.log(`  - Unidad: ${unidad}`);
    console.log(`  - Ubicación: ${ubicacion}`);
    console.log(`  - Usuario1: ${usuario1}`);
    console.log(`  - Usuario2: ${usuario2}`);
    console.log(`  - Usuario3: ${usuario3}`);

    // Validar número de anexo
    if (!isValidFixedNumber(numeroAnexo)) {
      console.log(
        `Fila ${i + 1}: Número de anexo inválido (${numeroAnexo}), omitiendo...`
      );
      skippedCount++;
      continue;
    }

    // Formatear campos
    const numeroFormateado = String(numeroAnexo).trim();
    const direccionFormateada = formatField(direccion, 100);
    const unidadFormateada = formatField(unidad, 50);
    const ubicacionFormateada = formatField(ubicacion, 100);

    try {
      // 1. Insertar en tabla numeros
      const numeroId = randomUUID();
      const insertNumeroQuery = `
        INSERT INTO numeros (id, numero, tipo, direccion, unidad, ubicacion)
        VALUES (@id, @numero, @tipo, @direccion, @unidad, @ubicacion)
      `;

      await execQuery(connection, insertNumeroQuery, [
        { name: "id", type: TYPES.UniqueIdentifier, value: numeroId },
        { name: "numero", type: TYPES.VarChar, value: numeroFormateado },
        { name: "tipo", type: TYPES.VarChar, value: "Fijo" },
        {
          name: "direccion",
          type: TYPES.VarChar,
          value: direccionFormateada,
        },
        { name: "unidad", type: TYPES.VarChar, value: unidadFormateada },
        { name: "ubicacion", type: TYPES.VarChar, value: ubicacionFormateada },
      ]);

      console.log(`Número ${numeroFormateado} insertado en tabla numeros`);

      // 2. Procesar usuarios (pueden ser 0, 1, 2 o 3 usuarios)
      const usuarios = [usuario1, usuario2, usuario3].filter(
        (u) => u && String(u).trim().length > 0
      );

      if (usuarios.length === 0) {
        console.log(`  - Sin usuarios asociados al número ${numeroFormateado}`);
      } else {
        for (let j = 0; j < usuarios.length; j++) {
          const nombreUsuario = formatField(usuarios[j], 50);

          if (nombreUsuario) {
            const usuarioId = randomUUID();
            const insertUsuarioQuery = `
              INSERT INTO usuarios_numeros (id, nombre, cargo)
              VALUES (@id, @nombre, @cargo)
            `;

            await execQuery(connection, insertUsuarioQuery, [
              { name: "id", type: TYPES.UniqueIdentifier, value: usuarioId },
              { name: "nombre", type: TYPES.VarChar, value: nombreUsuario },
              { name: "cargo", type: TYPES.VarChar, value: null }, // Sin cargo para teléfonos fijos
            ]);

            console.log(
              `  - Usuario ${
                j + 1
              }: ${nombreUsuario} insertado en tabla usuarios_numeros`
            );

            // 3. Crear relación en usuarios_numeros_rel
            const relacionId = randomUUID();
            const insertRelacionQuery = `
              INSERT INTO usuarios_numeros_rel (id, id_usuario, id_numero)
              VALUES (@id, @id_usuario, @id_numero)
            `;

            await execQuery(connection, insertRelacionQuery, [
              { name: "id", type: TYPES.UniqueIdentifier, value: relacionId },
              {
                name: "id_usuario",
                type: TYPES.UniqueIdentifier,
                value: usuarioId,
              },
              {
                name: "id_numero",
                type: TYPES.UniqueIdentifier,
                value: numeroId,
              },
            ]);

            console.log(`  - Relación creada entre usuario ${j + 1} y número`);
          }
        }
      }

      processedCount++;
    } catch (error) {
      console.error(`Error procesando fila ${i + 1}:`, error.message);
      skippedCount++;
    }
  }

  return { processed: processedCount, skipped: skippedCount };
}

// Función para procesar teléfonos celulares
async function procesarTelefonosCelulares(connection) {
  console.log("\n=== PROCESANDO TELÉFONOS CELULARES ===");

  if (dataCelulares.length < 3) {
    console.log("No hay suficientes datos en la hoja de teléfonos celulares");
    return { processed: 0, skipped: 0 };
  }

  // Mapeo de columnas basado en la estructura del Excel
  const chipNumeroIndex = 0; // Columna A - CHIP_NUMERO_MOVIL
  const estadoLineaIndex = 7; // Columna H - ESTADO_LINEA
  const estadoCelularIndex = 8; // Columna I - ESTADO_CELULAR
  const direccionIndex = 18; // Ajustar según la posición real en el Excel
  const unidadIndex = 19; // Ajustar según la posición real en el Excel
  const nombreIndex = 20; // Ajustar según la posición real en el Excel
  const cargoIndex = 21; // Ajustar según la posición real en el Excel

  console.log(`Mapeo de columnas para teléfonos celulares:`);
  console.log(`- CHIP_NUMERO_MOVIL: índice ${chipNumeroIndex} (Columna A)`);
  console.log(`- ESTADO_LINEA: índice ${estadoLineaIndex} (Columna H)`);
  console.log(`- ESTADO_CELULAR: índice ${estadoCelularIndex} (Columna I)`);
  console.log(`- DIRECCION: índice ${direccionIndex}`);
  console.log(`- UNIDAD: índice ${unidadIndex}`);
  console.log(`- NOMBRE: índice ${nombreIndex}`);
  console.log(`- CARGO: índice ${cargoIndex}`);

  let processedCount = 0;
  let skippedCount = 0;

  // Procesar cada fila del Excel (empezar desde la fila 3, índice 2, para saltar encabezados)
  for (let i = 2; i < dataCelulares.length; i++) {
    const row = dataCelulares[i];

    if (!row || row.length === 0) {
      console.log(`Fila ${i + 1}: Vacía, omitiendo...`);
      skippedCount++;
      continue;
    }

    console.log(`Procesando fila ${i + 1} (Celulares)...`);

    // Extraer datos usando los índices de posición
    const chipNumeroMovil = row[chipNumeroIndex];
    const estadoLinea = row[estadoLineaIndex];
    const estadoCelular = row[estadoCelularIndex];
    const direccion = row[direccionIndex];
    const unidad = row[unidadIndex];
    const nombre = row[nombreIndex];
    const cargo = row[cargoIndex];

    console.log(`  - Chip: ${chipNumeroMovil}`);
    console.log(`  - Estado Línea: ${estadoLinea}`);
    console.log(`  - Estado Celular: ${estadoCelular}`);
    console.log(`  - Dirección: ${direccion}`);
    console.log(`  - Unidad: ${unidad}`);
    console.log(`  - Nombre: ${nombre}`);
    console.log(`  - Cargo: ${cargo}`);

    // Validar estado (debe ser "HABILITADO" en estado_linea)
    const estadoLineaStr = estadoLinea
      ? String(estadoLinea).toUpperCase().trim()
      : "";

    if (estadoLineaStr !== "HABILITADO") {
      console.log(
        `Fila ${
          i + 1
        }: Estado línea no es HABILITADO (${estadoLinea}), omitiendo...`
      );
      skippedCount++;
      continue;
    }

    // Validar número de celular
    if (!isValidCellNumber(chipNumeroMovil)) {
      console.log(
        `Fila ${
          i + 1
        }: Número de celular inválido (${chipNumeroMovil}), omitiendo...`
      );
      skippedCount++;
      continue;
    }

    // Formatear campos
    const numeroFormateado = cleanCellNumber(chipNumeroMovil); // Usar la función de limpieza
    const direccionFormateada = formatField(direccion, 50);
    const unidadFormateada = formatField(unidad, 50);
    const nombreFormateado = formatField(nombre, 50);
    const cargoFormateado = formatField(cargo, 50);

    try {
      // 1. Insertar en tabla numeros
      const numeroId = randomUUID();
      const insertNumeroQuery = `
        INSERT INTO numeros (id, numero, tipo, direccion, unidad, ubicacion)
        VALUES (@id, @numero, @tipo, @direccion, @unidad, @ubicacion)
      `;

      await execQuery(connection, insertNumeroQuery, [
        { name: "id", type: TYPES.UniqueIdentifier, value: numeroId },
        { name: "numero", type: TYPES.VarChar, value: numeroFormateado },
        { name: "tipo", type: TYPES.VarChar, value: "Móvil" },
        {
          name: "direccion",
          type: TYPES.VarChar,
          value: direccionFormateada,
        },
        { name: "unidad", type: TYPES.VarChar, value: unidadFormateada },
        { name: "ubicacion", type: TYPES.VarChar, value: null }, // Los móviles no tienen ubicación
      ]);

      console.log(`Número ${numeroFormateado} insertado en tabla numeros`);

      // 2. Si hay nombre, insertar en usuarios_numeros y crear relación
      if (nombreFormateado) {
        const usuarioId = randomUUID();
        const insertUsuarioQuery = `
          INSERT INTO usuarios_numeros (id, nombre, cargo)
          VALUES (@id, @nombre, @cargo)
        `;

        await execQuery(connection, insertUsuarioQuery, [
          { name: "id", type: TYPES.UniqueIdentifier, value: usuarioId },
          { name: "nombre", type: TYPES.VarChar, value: nombreFormateado },
          { name: "cargo", type: TYPES.VarChar, value: cargoFormateado },
        ]);

        console.log(
          `Usuario ${nombreFormateado} insertado en tabla usuarios_numeros`
        );

        // 3. Crear relación en usuarios_numeros_rel
        const relacionId = randomUUID();
        const insertRelacionQuery = `
          INSERT INTO usuarios_numeros_rel (id, id_usuario, id_numero)
          VALUES (@id, @id_usuario, @id_numero)
        `;

        await execQuery(connection, insertRelacionQuery, [
          { name: "id", type: TYPES.UniqueIdentifier, value: relacionId },
          {
            name: "id_usuario",
            type: TYPES.UniqueIdentifier,
            value: usuarioId,
          },
          {
            name: "id_numero",
            type: TYPES.UniqueIdentifier,
            value: numeroId,
          },
        ]);

        console.log(`Relación creada entre usuario y número`);
      }

      processedCount++;
    } catch (error) {
      console.error(`Error procesando fila ${i + 1}:`, error.message);
      skippedCount++;
    }
  }

  return { processed: processedCount, skipped: skippedCount };
}

// Función principal
async function run() {
  const connection = await connectDB();
  console.log("Conexión a la base de datos establecida.");

  try {
    // LIMPIEZA GENERAL DE LAS 3 TABLAS (UNA SOLA VEZ AL INICIO)
    console.log("\n=== LIMPIEZA GENERAL DE TABLAS ===");
    console.log("Limpiando todas las tablas completamente...");

    // Eliminar en orden correcto (relaciones primero)
    await execQuery(connection, `DELETE FROM usuarios_numeros_rel`);
    console.log("Tabla usuarios_numeros_rel limpiada completamente.");

    await execQuery(connection, `DELETE FROM usuarios_numeros`);
    console.log("Tabla usuarios_numeros limpiada completamente.");

    await execQuery(connection, `DELETE FROM numeros`);
    console.log("Tabla numeros limpiada completamente.");

    console.log("Limpieza general finalizada.");

    // Procesar teléfonos fijos primero
    const resultadosFijos = await procesarTelefonosFijos(connection);

    // Procesar teléfonos celulares después
    const resultadosCelulares = await procesarTelefonosCelulares(connection);

    // Resumen final
    console.log(`\n=== RESUMEN FINAL ===`);
    console.log(`TELÉFONOS FIJOS:`);
    console.log(`  - Procesados exitosamente: ${resultadosFijos.processed}`);
    console.log(`  - Omitidos: ${resultadosFijos.skipped}`);
    console.log(`TELÉFONOS CELULARES:`);
    console.log(
      `  - Procesados exitosamente: ${resultadosCelulares.processed}`
    );
    console.log(`  - Omitidos: ${resultadosCelulares.skipped}`);
    console.log(`TOTAL GENERAL:`);
    console.log(
      `  - Procesados: ${
        resultadosFijos.processed + resultadosCelulares.processed
      }`
    );
    console.log(
      `  - Omitidos: ${resultadosFijos.skipped + resultadosCelulares.skipped}`
    );
    console.log(`Proceso completo finalizado exitosamente.`);
  } catch (error) {
    console.error("Error durante la ejecución:", error);
  } finally {
    connection.close();
    console.log("Conexión cerrada.");
  }
}

// Ejecutar el script
run().catch(console.error);
