"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconEdit,
  IconTrash,
  IconLoader2,
  IconX,
  IconAlertTriangle,
  IconBuilding,
} from "@tabler/icons-react";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";

interface Direccion {
  id: string;
  nombre: string;
}

interface DireccionesProps {
  searchTerm: string;
  refreshTrigger: number;
}

interface EditFormData {
  nombre: string;
}

// Componente CharacterCounter
interface CharacterCounterProps {
  current: number;
  max: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max }) => {
  const getColor = () => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return "text-red-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <span className={`text-xs ${getColor()}`}>
      {current}/{max}
    </span>
  );
};

export default function Direcciones({
  searchTerm,
  refreshTrigger,
}: DireccionesProps) {
  const { token } = useAuth();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDireccion, setSelectedDireccion] = useState<Direccion | null>(
    null
  );
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nombre: "",
  });
  const [errors, setErrors] = useState<Partial<EditFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar direcciones basado en el término de búsqueda
  const filteredDirecciones = useMemo(() => {
    if (!searchTerm.trim()) return direcciones;

    return direcciones.filter((direccion) =>
      direccion.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [direcciones, searchTerm]);

  const fetchDirecciones = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/direcciones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDirecciones(data.direcciones || []);
      } else {
        toast.error("Error al cargar las direcciones");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión al cargar direcciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDirecciones();
    }
  }, [token, refreshTrigger]);

  const handleEdit = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
    setEditFormData({
      nombre: direccion.nombre,
    });
    setErrors({});
    setEditModalOpen(true);
  };

  const handleDelete = (direccion: Direccion) => {
    setSelectedDireccion(direccion);
    setDeleteModalOpen(true);
  };

  const validateEditForm = (): boolean => {
    const newErrors: Partial<EditFormData> = {};

    if (!editFormData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm() || !selectedDireccion) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/direcciones", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedDireccion.id,
          ...editFormData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Dirección actualizada exitosamente");
        setEditModalOpen(false);
        fetchDirecciones();
      } else {
        toast.error(data.error || "Error al actualizar la dirección");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDireccion) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/direcciones?id=${selectedDireccion.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Dirección eliminada exitosamente");
        setDeleteModalOpen(false);
        fetchDirecciones();
      } else {
        toast.error(data.error || "Error al eliminar la dirección");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedDireccion(null);
    setEditFormData({ nombre: "" });
    setErrors({});
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedDireccion(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-[#025964]" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        {filteredDirecciones.length === 0 ? (
          <div className="text-center py-12">
            <IconBuilding className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "No se encontraron direcciones"
                : "No hay direcciones"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Comienza creando una nueva dirección"}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDirecciones.map((direccion) => (
                  <tr key={direccion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {direccion.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(direccion)}
                          className="text-[#025964] hover:text-[#034a52] p-1 rounded hover:bg-blue-50"
                          title="Editar dirección"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(direccion)}
                          className="p-1 rounded text-red-600 hover:text-red-900 hover:bg-red-50"
                          title={"Eliminar dirección"}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {editModalOpen && selectedDireccion && (
        <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Editar Dirección
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IconX className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                    <span>Nombre *</span>
                    <CharacterCounter current={editFormData.nombre.length} max={50} />
                  </label>
                  <input
                    type="text"
                    value={editFormData.nombre}
                    maxLength={50}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nombre: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#025964] focus:border-transparent ${
                      errors.nombre ? "border-red-500" : ""
                    }`}
                    placeholder="Ingresa el nombre de la dirección"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#025964] text-white rounded-md hover:bg-[#034a52] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin mr-2 inline" />
                        Actualizando...
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminación */}
      {deleteModalOpen && selectedDireccion && (
        <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <IconAlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la dirección{" "}
              <span className="font-semibold">
                "{selectedDireccion.nombre}"
              </span>
              ? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin mr-2 inline" />
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
