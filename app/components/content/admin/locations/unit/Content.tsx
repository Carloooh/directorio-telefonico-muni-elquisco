"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  IconEdit,
  IconTrash,
  IconLoader2,
  IconX,
  IconAlertTriangle,
  IconBuilding,
  IconFileText,
  IconUsers,
} from "@tabler/icons-react";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";

interface Unidad {
  id: string;
  nombre: string;
}

interface UnidadesProps {
  searchTerm: string;
  refreshTrigger: number;
}

interface EditFormData {
  nombre: string;
}

// Componente CharacterCounter
const CharacterCounter = ({
  current,
  max,
}: {
  current: number;
  max: number;
}) => {
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

export default function Unidades({
  searchTerm,
  refreshTrigger,
}: UnidadesProps) {
  const { token } = useAuth();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    nombre: "",
  });
  const [errors, setErrors] = useState<Partial<EditFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar unidades basado en el término de búsqueda
  const filteredUnidades = useMemo(() => {
    if (!searchTerm.trim()) return unidades;

    return unidades.filter((unidad) =>
      unidad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [unidades, searchTerm]);

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/unidades", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnidades(data.unidades || []);
      } else {
        toast.error("Error al cargar las unidades/departamentos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión al cargar unidades/departamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUnidades();
    }
  }, [token, refreshTrigger]);

  const handleEdit = (unidad: Unidad) => {
    setSelectedUnidad(unidad);
    setEditFormData({
      nombre: unidad.nombre,
    });
    setErrors({});
    setEditModalOpen(true);
  };

  const handleDelete = (unidad: Unidad) => {
    setSelectedUnidad(unidad);
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

    if (!validateEditForm() || !selectedUnidad) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/unidades", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedUnidad.id,
          ...editFormData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Unidad/Departamento actualizada exitosamente");
        setEditModalOpen(false);
        fetchUnidades();
      } else {
        toast.error(data.error || "Error al actualizar la unidad/departamento");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUnidad) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/unidades?id=${selectedUnidad.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Unidad/Departamento eliminada exitosamente");
        setDeleteModalOpen(false);
        fetchUnidades();
      } else {
        toast.error(data.error || "Error al eliminar la unidad/departamento");
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
    setSelectedUnidad(null);
    setEditFormData({ nombre: "" });
    setErrors({});
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedUnidad(null);
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
        {filteredUnidades.length === 0 ? (
          <div className="text-center py-12">
            <IconBuilding className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No se encontraron unidades" : "No hay unidades"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Comienza creando una nueva unidad/departamento"}
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
                {filteredUnidades.map((unidad) => (
                  <tr key={unidad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {unidad.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(unidad)}
                          className="text-[#025964] hover:text-[#034a52] p-1 rounded hover:bg-blue-50"
                          title="Editar unidad/departamento"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(unidad)}
                          className="p-1 rounded text-red-600 hover:text-red-900 hover:bg-red-50"
                          title={"Eliminar unidad/departamento"}
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
      {editModalOpen && selectedUnidad && (
        <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Editar Unidad/Departamento
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
                    <CharacterCounter
                      current={editFormData.nombre.length}
                      max={50}
                    />
                  </label>
                  <input
                    type="text"
                    value={editFormData.nombre}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nombre: e.target.value,
                      })
                    }
                    maxLength={50}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#025964] focus:border-transparent ${
                      errors.nombre ? "border-red-500" : ""
                    }`}
                    placeholder="Ingresa el nombre de la unidad o departamento"
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
      {deleteModalOpen && selectedUnidad && (
        <div className="fixed inset-0 bg-black/35 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <IconAlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la unidad{" "}
              <span className="font-semibold">"{selectedUnidad.nombre}"</span>?
              Esta acción no se puede deshacer.
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
