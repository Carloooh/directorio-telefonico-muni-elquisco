"use client";
import { IconDownload } from "@tabler/icons-react";
import ExcelJS from "exceljs";
import { useState } from "react";

export default function ExportContactsBtn() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contactos");
      if (!res.ok) throw new Error("Error al obtener contactos");
      const contacts = await res.json();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Contactos");

      // Definir estilos
      const headerStyle = {
        fill: {
          type: "pattern" as const,
          pattern: "solid" as const,
          fgColor: { argb: "FF164e63" }, // Azul oscuro
        },
        font: {
          color: { argb: "FFFFFFFF" }, // Blanco
          bold: true,
          size: 12,
        },
        border: {
          top: { style: "thin" as const },
          left: { style: "thin" as const },
          bottom: { style: "thin" as const },
          right: { style: "thin" as const },
        },
        alignment: {
          vertical: "middle" as const,
          horizontal: "center" as const,
        },
      };

      const groupStyleLight = {
        fill: {
          type: "pattern" as const,
          pattern: "solid" as const,
          fgColor: { argb: "FFFFFFFF" }, // Blanco
        },
      };

      const groupStyleDark = {
        fill: {
          type: "pattern" as const,
          pattern: "solid" as const,
          fgColor: { argb: "FFF0F8FF" }, // Azul muy claro
        },
      };

      // Estilo específico para la columna Tipo
      const tipoStyle = {
        alignment: {
          vertical: "middle" as const,
          horizontal: "left" as const,
        },
      };

      // Estilo específico para la columna Anexo/Número
      const anexoNumberStyle = {
        alignment: {
          vertical: "middle" as const,
          horizontal: "left" as const,
        },
      };

      // Encabezados
      const headers = [
        "Tipo",
        "Anexo/Número",
        "Usuario(s)",
        "Cargo",
        "Unidad",
        "Dirección",
        "Sigla Dirección",
        "Ubicación",
      ];

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.style = headerStyle;
      });

      // Procesar datos y agregar filas
      let currentRow = 2; // Empezar después de los encabezados
      const groupRanges: { start: number; end: number; style: any }[] = [];

      contacts.forEach((c: any, groupIndex: number) => {
        const contactNumber =
          c.tipo === "Fijo" ? c.anexo || c.numero || "" : c.numero || "";
        const contactsGroup = [];

        // Contacto principal
        if (c.nombre) {
          contactsGroup.push({
            Tipo: c.tipo || "",
            "Anexo/Número": contactNumber,
            "Usuario(s)": c.nombre || "",
            Cargo: c.cargo || "",
            Unidad: c.unidad || "",
            Dirección: c.direccion || "",
            "Sigla Dirección": c.sigla || "",
            Ubicación: c.ubicacion || "",
          });
        }

        // Contactos adicionales
        if (Array.isArray(c.additionalContacts)) {
          c.additionalContacts.forEach((ac: any) => {
            if (ac && ac.nombre) {
              contactsGroup.push({
                Tipo: c.tipo || "",
                "Anexo/Número": contactNumber,
                "Usuario(s)": ac.nombre || "",
                Cargo: ac.cargo || "",
                Unidad: ac.unidad || c.unidad || "",
                Dirección: ac.direccion || c.direccion || "",
                "Sigla Dirección": ac.sigla || c.sigla || "",
                Ubicación: ac.ubicacion || c.ubicacion || "",
              });
            }
          });
        }

        // Si el grupo tiene contactos
        if (contactsGroup.length > 0) {
          const groupStartRow = currentRow;
          const groupStyle =
            groupIndex % 2 === 0 ? groupStyleLight : groupStyleDark;

          // Agregar cada fila del grupo
          contactsGroup.forEach((contact) => {
            const row = worksheet.addRow(Object.values(contact));

            // Aplicar estilos a cada celda
            row.eachCell((cell, colNumber) => {
              cell.style = { ...groupStyle };

              // Aplicar estilo especial para la columna Tipo (columna A, índice 1)
              if (colNumber === 1) {
                cell.style = {
                  ...cell.style,
                  ...tipoStyle,
                };
              }

              // Aplicar estilo especial para la columna Anexo/Número (columna B, índice 2)
              if (colNumber === 2) {
                cell.style = {
                  ...cell.style,
                  ...anexoNumberStyle,
                };
              }
            });

            currentRow++;
          });

          const groupEndRow = currentRow - 1;

          // Guardar el rango del grupo para aplicar bordes exteriores después
          groupRanges.push({
            start: groupStartRow,
            end: groupEndRow,
            style: groupStyle,
          });

          // Fusionar celdas de Tipo y Anexo/Número para el grupo
          if (contactsGroup.length > 1) {
            worksheet.mergeCells(`A${groupStartRow}:A${groupEndRow}`);
            worksheet.mergeCells(`B${groupStartRow}:B${groupEndRow}`);

            // Aplicar alineación especial para Tipo fusionado
            const cellA = worksheet.getCell(`A${groupStartRow}`);
            cellA.style = {
              ...cellA.style,
              ...tipoStyle,
            };

            // Aplicar alineación especial para Anexo/Número fusionado
            const cellB = worksheet.getCell(`B${groupStartRow}`);
            cellB.style = {
              ...cellB.style,
              ...anexoNumberStyle,
            };
          } else {
            // Para grupos de una sola fila, asegurar la alineación de Tipo y Anexo/Número
            const cellA = worksheet.getCell(`A${groupStartRow}`);
            cellA.style = {
              ...cellA.style,
              ...tipoStyle,
            };

            const cellB = worksheet.getCell(`B${groupStartRow}`);
            cellB.style = {
              ...cellB.style,
              ...anexoNumberStyle,
            };
          }
        }
      });

      // Aplicar bordes exteriores a cada grupo
      groupRanges.forEach((range) => {
        for (let rowNum = range.start; rowNum <= range.end; rowNum++) {
          const row = worksheet.getRow(rowNum);

          row.eachCell((cell, colNumber) => {
            // Aplicar bordes según la posición en el grupo
            const borders: any = {};

            // Borde superior (solo primera fila del grupo)
            if (rowNum === range.start) {
              borders.top = { style: "thin" };
            }

            // Borde inferior (solo última fila del grupo)
            if (rowNum === range.end) {
              borders.bottom = { style: "thin" };
            }

            // Borde izquierdo (siempre)
            borders.left = { style: "thin" };

            // Borde derecho (siempre)
            borders.right = { style: "thin" };

            cell.style = {
              ...cell.style,
              border: borders,
              fill: range.style.fill,
            };
          });
        }
      });

      // Ajustar anchos de columnas
      worksheet.columns = [
        { width: 10 }, // Tipo
        { width: 15 }, // Anexo/Número
        { width: 30 }, // Usuario(s)
        { width: 28 }, // Cargo - AUMENTADO
        { width: 25 }, // Unidad
        { width: 35 }, // Dirección
        { width: 18 }, // Sigla Dirección
        { width: 28 }, // Ubicación - AUMENTADO
      ];

      // Congelar encabezados
      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      // Generar archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "contactos.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al exportar:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white border border-[#164e63] bg-[#164e63] hover:bg-white hover:text-[#164e63] rounded-lg transition-colors"
    >
      <IconDownload size={20} />{" "}
      {loading ? "Exportando..." : "Exportar Contactos"}
    </button>
  );
}
