"use client";

import React, { useState } from "react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useAuth } from "@/app/hooks/useAuth";
import { toast } from "react-hot-toast";

interface BannerProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

interface FormData {
  nombre: string;
  sigla: string;
}

// Componente CharacterCounter
interface CharacterCounterProps {
  current: number;
  max: number;
}

const CharacterCounter: React.FC<CharacterCounterProps> = ({ current, max }) => {
  const getColor = () => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-gray-500";
  };

  return (
    <span className={`text-xs ${getColor()}`}>
      {current}/{max}
    </span>
  );
};

export default function Banner({
  searchTerm,
  onSearchChange,
  onRefresh,
}: BannerProps) {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    sigla: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/direcciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Dirección creada exitosamente");
        setIsModalOpen(false);
        setFormData({ nombre: "", sigla: "" });
        setErrors({});
        onRefresh();
      } else {
        toast.error(data.error || "Error al crear dirección");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ nombre: "", sigla: "" });
    setErrors({});
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar direcciones..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#025964] focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#164e63] text-white px-4 py-2 rounded-lg hover:text-[#164e63] hover:bg-white transition-colors border-1 border-[#164e63]"
        >
          <IconPlus className="h-5 w-5" />
          Nueva Dirección
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 p-4 min-h-screen">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Nueva Dirección
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre * <CharacterCounter current={formData.nombre.length} max={50} />
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    maxLength={50}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#025964] focus:border-transparent ${
                      errors.nombre ? "border-red-500" : ""
                    }`}
                    placeholder="Ingresa el nombre de la dirección"
                    required
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                  )}
                </div>

                {/* Sigla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sigla <CharacterCounter current={formData.sigla.length} max={15} />
                  </label>
                  <input
                    type="text"
                    name="sigla"
                    value={formData.sigla}
                    onChange={(e) =>
                      setFormData({ ...formData, sigla: e.target.value })
                    }
                    maxLength={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#025964] focus:border-transparent"
                    placeholder="Ingresa la sigla (opcional)"
                  />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-[#164e63] text-white rounded-md hover:bg-[#164e63]/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Creando..." : "Crear Dirección"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
