import { Connection, Request, TYPES } from "tedious";
import config from "@/app/lib/dbConfig";

// Constantes para manejo de BigInt
export const MAX_SAFE_INTEGER = 9007199254740991;
export const MIN_MONTO = 0;
export const BIGINT_FIELDS = [
  "monto",
  "aporte_total",
  "aporte_municipal",
  "aporte_terceros",
];
export const CALCULATED_MONTO_FIELDS = [
  "monto_total",
  "monto_programas",
  "monto_gestion_interna",
  "programas_total",
  "gestion_interna_total",
  "programas_count",
  "gestion_interna_count",
];

// Función mejorada para detectar campos de monto de forma global y robusta
const detectMontoFieldFromQuery = (
  query: string,
  paramIndex: number
): boolean => {
  // Normalizar la consulta removiendo espacios extra y comentarios
  const normalizedQuery = query
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/--.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  // Buscar todos los parámetros en la consulta
  const allParams = normalizedQuery.match(/@param\d+/gi) || [];
  if (paramIndex >= allParams.length) return false;

  const currentParam = allParams[paramIndex];

  // Patrón 1: INSERT INTO tabla (campos) VALUES (parámetros)
  const insertMatch = normalizedQuery.match(
    /INSERT\s+INTO\s+[\w\[\]]+\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i
  );
  if (insertMatch) {
    const fieldsStr = insertMatch[1];
    const valuesStr = insertMatch[2];

    // Extraer nombres de campos limpiando corchetes y espacios
    const fields = fieldsStr.split(",").map((f) =>
      f
        .trim()
        .replace(/[\[\]]/g, "")
        .toLowerCase()
    );

    // Extraer parámetros en orden
    const paramMatches = valuesStr.match(/@param\d+/gi) || [];
    const paramPosition = paramMatches.findIndex(
      (p) => p.toLowerCase() === currentParam.toLowerCase()
    );

    if (paramPosition !== -1 && paramPosition < fields.length) {
      const fieldName = fields[paramPosition];
      return (
        BIGINT_FIELDS.includes(fieldName) ||
        CALCULATED_MONTO_FIELDS.includes(fieldName)
      );
    }
  }

  // Patrón 2: UPDATE tabla SET campo = @param
  const updateMatch = normalizedQuery.match(
    /UPDATE\s+[\w\[\]]+\s+SET\s+([^WHERE^ORDER^GROUP]+)/i
  );
  if (updateMatch) {
    const setClause = updateMatch[1];

    // Buscar todas las asignaciones campo = @param
    const assignmentRegex = /([\w\[\]]+)\s*=\s*(@param\d+)/gi;
    let match;

    while ((match = assignmentRegex.exec(setClause)) !== null) {
      const fieldName = match[1].replace(/[\[\]]/g, "").toLowerCase();
      const paramName = match[2].toLowerCase();

      if (paramName === currentParam.toLowerCase()) {
        return (
          BIGINT_FIELDS.includes(fieldName) ||
          CALCULATED_MONTO_FIELDS.includes(fieldName)
        );
      }
    }
  }

  // Patrón 3: Búsqueda por contexto - si la consulta menciona tablas con campos de monto
  const tablePatterns = [
    /programas/i,
    /desgloses_items_presupuestarios/i,
    /desgloses_items_gestion_interna/i,
    /items_presupuestarios/i,
  ];

  const hasMontoTable = tablePatterns.some((pattern) =>
    pattern.test(normalizedQuery)
  );

  if (hasMontoTable) {
    // Buscar patrones donde el parámetro actual esté cerca de palabras clave de monto
    const montoKeywords = ["monto", "aporte", "total", "municipal", "terceros"];
    const paramPattern = new RegExp(
      `(${montoKeywords.join("|")}).*?${currentParam.replace(
        "$",
        "\\$"
      )}|${currentParam.replace("$", "\\$")}.*?(${montoKeywords.join("|")})`,
      "i"
    );

    if (paramPattern.test(normalizedQuery)) {
      return true;
    }
  }

  // Patrón 4: Detectar por posición en consultas comunes
  // Para consultas de inserción en tablas conocidas, verificar posiciones típicas de campos de monto
  if (insertMatch) {
    const tableName = normalizedQuery
      .match(/INSERT\s+INTO\s+([\w\[\]]+)/i)?.[1]
      ?.toLowerCase();

    // Mapeo de posiciones típicas de campos de monto por tabla
    const tableMontoPositions: { [key: string]: number[] } = {
      programas: [2, 3, 4, 5], // posiciones típicas de monto, aporte_total, aporte_municipal, aporte_terceros
      desgloses_items_presupuestarios: [3, 4], // posiciones típicas de monto
      desgloses_items_gestion_interna: [3, 4], // posiciones típicas de monto
      items_presupuestarios: [1, 2], // posiciones típicas de monto
    };

    if (tableName && tableMontoPositions[tableName]) {
      return tableMontoPositions[tableName].includes(paramIndex);
    }
  }

  return false;
};

export interface ITediousColumn {
  value: any;
  metadata: {
    colName: string;
  };
}

export const executeQuery = <T = any>(
  query: string,
  parameters: any[] = []
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    const results: T[] = [];

    connection.on("connect", (err) => {
      if (err) {
        reject(err);
        return;
      }

      const request = new Request(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.close();
      });

      // Procesar parámetros y convertir automáticamente INT a BIGINT para campos de monto
      parameters.forEach((param, index) => {
        let finalParam = { ...param };

        // Si el parámetro es INT y detectamos que es un campo de monto, convertir a BIGINT
        if (
          param.type === TYPES.Int &&
          detectMontoFieldFromQuery(query, index)
        ) {
          finalParam.type = TYPES.BigInt;

          // Validar que el valor esté en rango seguro
          if (param.value > MAX_SAFE_INTEGER) {
            reject(
              new Error(
                `Valor ${param.value} excede el límite máximo permitido (${MAX_SAFE_INTEGER})`
              )
            );
            return;
          }
        }

        request.addParameter(
          `param${index + 1}`,
          finalParam.type,
          finalParam.value
        );
      });

      request.on("row", (columns: ITediousColumn[]) => {
        const row: any = {};
        columns.forEach((column) => {
          let value = column.value;

          // Convertir BigInt a Number si está en rango seguro para campos de monto
          if (
            BIGINT_FIELDS.includes(column.metadata.colName.toLowerCase()) ||
            CALCULATED_MONTO_FIELDS.includes(
              column.metadata.colName.toLowerCase()
            )
          ) {
            if (typeof value === "bigint") {
              if (
                value <= MAX_SAFE_INTEGER &&
                value >= Number.MIN_SAFE_INTEGER
              ) {
                value = Number(value);
              } else {
                value = value.toString();
              }
            }
          }

          row[column.metadata.colName] = value;
        });
        results.push(row);
      });

      connection.execSql(request);
    });

    connection.connect();
  });
};
