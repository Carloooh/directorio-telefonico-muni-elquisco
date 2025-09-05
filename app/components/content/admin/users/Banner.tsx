"use client";

import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/useAuth"; // Agregar esta importación

interface BannerProps {
  onUserCreated: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Banner = ({ onUserCreated, searchTerm, onSearchChange }: BannerProps) => {
  const { token } = useAuth(); // Agregar esta línea
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    usuario: "",
    email: "",
    rol: "Administrador",
  });

  // Controlar el overflow del body cuando el modal está abierto
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name !== "rut") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario creado exitosamente");
        setShowModal(false);
        setFormData({
          nombre: "",
          usuario: "",
          email: "",
          rol: "Administrador",
        });
        onUserCreated();
      } else {
        toast.error(data.error || "Error al crear usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nombre: "",
      usuario: "",
      email: "",
      rol: "Administrador",
    });
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full md:w-auto">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconSearch className="w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full md:w-64 pl-10 p-2.5"
            placeholder="Buscar usuarios..."
          />
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center rounded-lg px-4 py-2 transition-colors text-sm text-white bg-[#025964] hover:bg-[#00D47E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00D47E]"
        >
          <IconPlus className="w-5 h-5 mr-2" />
          <span className="hidden md:block">Nuevo Usuario</span>
          <span className="block md:hidden">Nuevo</span>
        </button>
      </div>

      {/* Modal para crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Crear Nuevo Usuario
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: jperez"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: juan@ejemplo.com"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Se generará una contraseña temporal que
                  será enviada al email del usuario.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleCloseModal}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Creando..." : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;
