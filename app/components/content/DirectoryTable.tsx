"use client";
import { useState, useEffect } from "react";
import {
  IconSearch,
  IconEdit,
  IconTrash,
  IconPhone,
  IconDeviceMobile,
  IconUser,
  IconPlus,
  IconBriefcase2,
} from "@tabler/icons-react";
import { AddContactModal } from "@/app/components/content/AddContactModal";
import { EditContactModal } from "@/app/components/content/EditContactModal";
import toast from "react-hot-toast";

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
  sigla: string;
  additionalContacts?: {
    nombre: string;
    unidad: string;
    cargo: string;
    direccion: string;
    ubicacion: string;
    sigla: string;
  }[];
}

interface Direction {
  nombre: string;
  sigla: string;
}

interface Unit {
  nombre: string;
}

interface Location {
  nombre: string;
}

interface Job {
  nombre: string;
}

interface DirectoryTableProps {
  contacts: Contact[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isLoggedIn: boolean;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  onRefreshContacts?: () => void;
}

export function DirectoryTable({
  contacts,
  searchTerm,
  onSearchChange,
  isLoggedIn,
  onEditContact,
  onDeleteContact,
  onRefreshContacts,
}: DirectoryTableProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [direcciones, setDirecciones] = useState<Direction[]>([]);
  const [unidades, setUnidades] = useState<Unit[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Location[]>([]);
  const [cargos, setCargos] = useState<Job[]>([]);

  const fetchDirecciones = async () => {
    try {
      const response = await fetch(`/api/direcciones`);
      const data = await response.json();

      if (data.success) {
        setDirecciones(data.direcciones);
      } else {
        toast.error("Error al cargar las direcciones");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las direcciones");
    } finally {
    }
  };

  const fetchUnidades = async () => {
    try {
      const response = await fetch(`/api/unidades`);
      const data = await response.json();

      if (data.success) {
        setUnidades(data.unidades);
      } else {
        toast.error("Error al cargar las unidades");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las unidades");
    } finally {
    }
  };

  const fetchUbicaciones = async () => {
    try {
      const response = await fetch("/api/ubicaciones");
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setUbicaciones(data.ubicaciones);
      } else {
        toast.error("Error al cargar las ubicaciones");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las ubicaciones");
    } finally {
    }
  };

  const fetchCargos = async () => {
    try {
      const response = await fetch(`/api/cargos`);
      const data = await response.json();

      if (data.success) {
        setCargos(data.cargos);
      } else {
        toast.error("Error al cargar los cargos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los cargos");
    } finally {
    }
  };

  useEffect(() => {
    fetchDirecciones();
    fetchUnidades();
    fetchUbicaciones();
    fetchCargos();
  }, []);

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
      normalizeText(contact.sigla).includes(searchNormalized) ||
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

  const handleContactAdded = () => {
    if (onRefreshContacts) {
      onRefreshContacts();
    }
  };

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsEditModalOpen(true);
  };

  const handleContactUpdated = () => {
    if (onRefreshContacts) {
      onRefreshContacts();
    }
  };

  const handleDeleteContact = (contactId: string) => {
    if (onDeleteContact) {
      onDeleteContact(contactId);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Título */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-semibold text-[#475569] tracking-tight">
          Directorio Telefónico
        </h1>
        {/* <p className="text-gray-600 text-xl">
          Municipalidad El Quisco
        </p> */}
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
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#164e63] border border-[#164e63] hover:bg-[#164e63] hover:text-white rounded-lg transition-colors"
            >
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
                <th className="w-45 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  <span>Anexo/Número</span>
                </th>
                <th className="w-1/2 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  Usuario(s)
                </th>
                <th className="w-1/2 text-left p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
                  Información
                </th>
                {isLoggedIn && (
                  <th className="w-25 text-right p-3 text-base font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="w-32 p-3">
                    <div className="flex items-start gap-2">
                      {contact.tipo === "Fijo" ? (
                        <IconPhone className="h-7 w-7 text-blue-600 flex-shrink-0 bg-blue-100 rounded-md p-1" />
                      ) : (
                        <IconDeviceMobile className="h-7 w-7 text-green-600 flex-shrink-0 bg-green-100 rounded-md p-0.5" />
                      )}
                      {contact.tipo === "Fijo" ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-md font-mono border border-gray-300 bg-white whitespace-nowrap">
                          {contact.anexo}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-md font-mono border border-gray-300 bg-white whitespace-nowrap">
                          {contact.numero}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="w-1/2 p-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <IconUser className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-base text-gray-900 font-medium text-md whitespace-nowrap">
                            {contact.nombre || "-"}
                          </span>
                        </div>
                        {contact.cargo && (
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <IconBriefcase2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-md text-gray-600 italic truncate">
                              {contact.cargo}
                            </span>
                          </div>
                        )}
                      </div>
                      {contact.tipo === "Fijo" &&
                        contact.additionalContacts &&
                        contact.additionalContacts.map(
                          (additionalContact, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <IconUser className="h-3 w-3 flex-shrink-0 text-gray-500" />
                                <span className="text-base text-gray-900 font-medium text-md whitespace-nowrap">
                                  {additionalContact.nombre || "-"}
                                </span>
                              </div>
                              {additionalContact.cargo && (
                                <div className="flex items-center gap-1 min-w-0 flex-1">
                                  <IconBriefcase2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  <span className="text-md text-gray-600 italic truncate">
                                    {additionalContact.cargo}
                                  </span>
                                </div>
                              )}
                            </div>
                          )
                        )}
                    </div>
                  </td>
                  <td className="w-1/2 p-3">
                    <div className="text-md text-gray-900 space-y-1">
                      <div className="flex items-start gap-1">
                        <span className="font-medium text-gray-900 min-w-fit text-md">
                          Unidad:
                        </span>
                        <span className="text-gray-900 break-words text-md">
                          {contact.unidad || "-"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1 text-md">
                        <span className="font-medium text-gray-900 min-w-fit text-md">
                          Dirección:
                        </span>
                        <span className="text-gray-900 break-words text-md">
                          {contact.direccion || "-"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1 text-md">
                        <span className="font-medium text-gray-900 min-w-fit text-md">
                          Sigla Dirección:
                        </span>
                        <span className="text-gray-900 break-words text-md">
                          {contact.sigla || "-"}
                        </span>
                      </div>
                      <div className="flex items-start gap-1 text-md">
                        <span className="font-medium text-gray-900 min-w-fit text-md">
                          Ubicación:
                        </span>
                        <span className="text-gray-900 break-words text-md">
                          {contact.ubicacion || "-"}
                        </span>
                      </div>
                    </div>
                  </td>
                  {isLoggedIn && (
                    <td className="w-20 p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditContact(contact)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Editar contacto"
                        >
                          <IconEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Eliminar contacto"
                        >
                          <IconTrash className="h-5 w-5" />
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

      {/* Modal para añadir contacto */}
      <AddContactModal
        direcciones={direcciones}
        unidades={unidades}
        ubicaciones={ubicaciones}
        cargos={cargos}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onContactAdded={handleContactAdded}
      />

      {/* Modal para editar contacto */}
      <EditContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onContactUpdated={handleContactUpdated}
        contact={contactToEdit}
        direcciones={direcciones}
        unidades={unidades}
        ubicaciones={ubicaciones}
        cargos={cargos}
      />
    </div>
  );
}
