"use client";
import { useState, useEffect } from "react";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconPhone,
  IconDeviceMobile,
  IconMapPin,
  IconBuilding,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";

interface Contact {
  id: string;
  anexo: string;
  numero: string;
  tipo: string;
  nombre: string;
  direccion: string;
  unidad: string;
  cargo: string;
  ubicacion: string;
  additionalContacts?: {
    nombre: string;
    unidad: string;
    cargo: string;
    direccion: string;
    ubicacion: string;
  }[];
}

interface DirectoryTableProps {
  contacts: Contact[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoggedIn: boolean;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
}

export function DirectoryTable({
  contacts,
  searchTerm,
  onSearchChange,
  isLoggedIn,
  onEditContact,
  onDeleteContact,
}: DirectoryTableProps) {
  // Función para normalizar texto (sin tildes y en minúsculas)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar contactos
  const filteredContacts = contacts.filter((contact) => {
    const searchNormalized = normalizeText(searchTerm);

    return (
      normalizeText(contact.nombre).includes(searchNormalized) ||
      normalizeText(contact.anexo).includes(searchNormalized) ||
      normalizeText(contact.numero).includes(searchNormalized) ||
      normalizeText(contact.tipo).includes(searchNormalized) ||
      normalizeText(contact.direccion).includes(searchNormalized) ||
      normalizeText(contact.unidad).includes(searchNormalized) ||
      normalizeText(contact.cargo).includes(searchNormalized) ||
      normalizeText(contact.ubicacion).includes(searchNormalized) ||
      (contact.additionalContacts &&
        contact.additionalContacts.some(
          (additionalContact) =>
            normalizeText(additionalContact.nombre).includes(
              searchNormalized
            ) ||
            normalizeText(additionalContact.unidad).includes(
              searchNormalized
            ) ||
            normalizeText(additionalContact.cargo).includes(searchNormalized) ||
            normalizeText(additionalContact.direccion).includes(
              searchNormalized
            ) ||
            normalizeText(additionalContact.ubicacion).includes(
              searchNormalized
            )
        ))
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Título */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-semibold text-[#475569] tracking-tight">
          Directorio Telefónico
        </h1>
        <p className="text-gray-600 text-xl">
          Gestión de contactos municipales
        </p>
      </div>

      {/* Buscador */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <IconSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 h-12 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Contador de contactos */}
      <div className="flex items-center justify-between">
        <span className="px-4 py-2 text-base font-medium rounded-full bg-gray-100 text-gray-700">
          {filteredContacts.length} contactos
        </span>
        {isLoggedIn && (
          <div className="flex justify-center">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#164e63] border border-[#164e63] hover:bg-[#164e63] hover:text-white rounded-lg transition-colors">
              <IconPlus className="h-4 w-4" />
              <span className="hidden md:block">Nuevo número</span>
              <span className="block md:hidden">Nuevo</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-32 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  <span className="hidden md:block">Anexo/Número</span>
                  <span className="block md:hidden">Anexo/Núm</span>
                </th>
                <th className="w-20 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="w-48 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  Usuario(s)
                </th>
                <th className="w-32 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="w-64 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  Información
                </th>
                {isLoggedIn && (
                  <th className="w-24 text-right p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="w-32 p-3 overflow-hidden">
                    <div className="flex items-center gap-2 truncate">
                      {contact.tipo === "Fijo" ? (
                        <IconPhone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <IconDeviceMobile className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {contact.tipo === "Fijo" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-base font-mono border border-gray-300 bg-white truncate">
                          {contact.anexo}
                        </span>
                      ) : (
                        <span className="font-mono text-black font-medium text-base truncate">
                          {contact.numero}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="w-20 p-3 overflow-hidden">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-base font-medium truncate ${
                        contact.tipo === "Fijo"
                          ? "bg-blue-100 text-blue-800"
                          : contact.tipo === "Móvil"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contact.tipo}
                    </span>
                  </td>
                  <td className="w-48 p-3 overflow-hidden">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 truncate">
                        <IconUser className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-base text-gray-900 truncate">
                          {contact.nombre || "-"}
                        </span>
                      </div>
                      {contact.tipo === "Fijo" &&
                        contact.additionalContacts &&
                        contact.additionalContacts.map(
                          (additionalContact, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 text-base text-gray-900 truncate"
                            >
                              <IconUser className="h-3 w-3 flex-shrink-0 text-gray-500" />
                              <span className="text-base text-gray-900 truncate">
                                {additionalContact.nombre || "-"}
                              </span>
                            </div>
                          )
                        )}
                    </div>
                  </td>
                  <td className="w-32 p-3 overflow-hidden">
                    {contact.tipo === "Móvil" ? (
                      <span className="text-base text-gray-900 truncate block">
                        {contact.cargo || "-"}
                      </span>
                    ) : (
                      <span className="text-base text-gray-400">-</span>
                    )}
                  </td>
                  <td className="w-64 p-3 overflow-hidden">
                    <div className="text-base text-gray-900 space-y-1">
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-gray-600">
                          Dirección:
                        </span>
                        <span className="text-gray-900">
                          {contact.direccion || "-"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-gray-600">
                          Unidad:
                        </span>
                        <span className="text-gray-900">
                          {contact.unidad || "-"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-gray-600">
                          Ubicación:
                        </span>
                        <span className="text-gray-900">
                          {contact.ubicacion || "-"}
                        </span>
                      </div>
                    </div>
                  </td>
                  {isLoggedIn && (
                    <td className="w-24 p-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            onEditContact && onEditContact(contact)
                          }
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            onDeleteContact && onDeleteContact(contact.id)
                          }
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mensaje cuando no hay contactos */}
      {filteredContacts.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="space-y-4">
            <div className="p-6 rounded-full bg-gray-100 w-fit mx-auto">
              <IconPhone className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No se encontraron contactos
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los términos de búsqueda
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
