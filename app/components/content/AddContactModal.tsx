"use client";
import { useState } from "react";
import {
  IconX,
  IconPhone,
  IconDeviceMobile,
  IconMapPin,
  IconBuilding,
  IconUser,
  IconBriefcase,
  IconLoader2,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useAuth } from "@/app/hooks/useAuth";
import toast from "react-hot-toast";

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
}

interface Usuario {
  nombre: string;
  cargo: string;
}

interface FormData {
  numero: string;
  tipo: "Fijo" | "Móvil";
  direccion: string;
  unidad: string;
  ubicacion: string;
  usuarios: Usuario[];
}

interface FormErrors {
  numero?: string;
  tipo?: string;
  direccion?: string;
  unidad?: string;
  ubicacion?: string;
  usuarios?: string[];
  general?: string;
}

// Componente para contador de caracteres
const CharacterCounter = ({
  current,
  max,
  className = "",
}: {
  current: number;
  max: number;
  className?: string;
}) => {
  const isNearLimit = current > max * 0.8;
  const isOverLimit = current > max;

  return (
    <span
      className={`text-xs ${
        isOverLimit
          ? "text-red-500"
          : isNearLimit
          ? "text-yellow-600"
          : "text-gray-500"
      } ${className}`}
    >
      {current}/{max}
    </span>
  );
};

export function AddContactModal({
  isOpen,
  onClose,
  onContactAdded,
}: AddContactModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    numero: "",
    tipo: "Fijo",
    direccion: "",
    unidad: "",
    ubicacion: "",
    usuarios: [{ nombre: "", cargo: "" }],
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar número
    if (!formData.numero.trim()) {
      newErrors.numero = "El número es requerido";
    } else {
      const numeroLimpio = formData.numero.replace(/[^0-9]/g, "");
      if (formData.tipo === "Móvil" && numeroLimpio.length !== 8) {
        newErrors.numero = "El número móvil debe tener exactamente 8 dígitos";
      } else if (formData.tipo === "Fijo" && numeroLimpio.length !== 4) {
        newErrors.numero = "El número fijo debe tener exactamente 4 dígitos";
      }
    }

    // Validar tipo
    if (!formData.tipo) {
      newErrors.tipo = "El tipo es requerido";
    }

    // Validar dirección (siempre obligatoria)
    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    // Validar unidad (siempre obligatoria)
    if (!formData.unidad.trim()) {
      newErrors.unidad = "La unidad es requerida";
    }

    // Validar ubicación (obligatoria solo para números fijos)
    if (formData.tipo === "Fijo" && !formData.ubicacion.trim()) {
      newErrors.ubicacion = "La ubicación es requerida para números fijos";
    }

    // Validar usuarios
    const usuarioErrors: string[] = [];
    formData.usuarios.forEach((usuario, index) => {
      if (!usuario.nombre.trim()) {
        usuarioErrors[index] = "El nombre es requerido";
      } else if (formData.tipo === "Móvil" && !usuario.cargo.trim()) {
        usuarioErrors[index] = "El cargo es requerido para números móviles";
      }
    });

    if (usuarioErrors.length > 0) {
      newErrors.usuarios = usuarioErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setErrors({ general: "No se encontró token de autenticación" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/contactos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Error al añadir contacto" });
        return;
      }

      toast.success(
        `Contacto añadido exitosamente. ${data.usuariosCreados} usuario(s) asociado(s).`
      );
      handleClose();
      onContactAdded(); // Esto triggerea el refetch en el componente padre
    } catch (error) {
      console.error("Error:", error);
      setErrors({ general: "Error de conexión" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      numero: "",
      tipo: "Fijo",
      direccion: "",
      unidad: "",
      ubicacion: "",
      usuarios: [{ nombre: "", cargo: "" }],
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleUsuarioChange = (
    index: number,
    field: keyof Usuario,
    value: string
  ) => {
    const newUsuarios = [...formData.usuarios];
    newUsuarios[index] = { ...newUsuarios[index], [field]: value };
    setFormData((prev) => ({ ...prev, usuarios: newUsuarios }));

    // Limpiar errores de usuario
    if (errors.usuarios && errors.usuarios[index]) {
      const newUsuarioErrors = [...(errors.usuarios || [])];
      newUsuarioErrors[index] = "";
      setErrors((prev) => ({ ...prev, usuarios: newUsuarioErrors }));
    }
  };

  const addUsuario = () => {
    if (formData.tipo === "Fijo") {
      setFormData((prev) => ({
        ...prev,
        usuarios: [...prev.usuarios, { nombre: "", cargo: "" }],
      }));
    }
  };

  const removeUsuario = (index: number) => {
    if (formData.usuarios.length > 1) {
      const newUsuarios = formData.usuarios.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, usuarios: newUsuarios }));
    }
  };

  const handleTipoChange = (newTipo: "Fijo" | "Móvil") => {
    setFormData((prev) => ({
      ...prev,
      tipo: newTipo,
      numero: "", // Reiniciar número
      usuarios: [{ nombre: "", cargo: "" }], // Reiniciar a un solo usuario
      ubicacion: newTipo === "Móvil" ? "" : prev.ubicacion, // Limpiar ubicación si es móvil
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ scrollbarGutter: "stable" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Añadir Nuevo Contacto
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <IconX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error general */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Información del Número */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              {formData.tipo === "Fijo" ? (
                <IconPhone className="h-5 w-5 text-blue-600" />
              ) : (
                <IconDeviceMobile className="h-5 w-5 text-green-500" />
              )}
              Número
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    handleTipoChange(e.target.value as "Fijo" | "Móvil")
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.tipo ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                >
                  <option value="Fijo">Fijo</option>
                  <option value="Móvil">Móvil</option>
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                )}
              </div>

              {/* Número */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {formData.tipo === "Fijo" ? "Anexo" : "Número"} *
                  </label>
                  <CharacterCounter
                    current={formData.numero.length}
                    max={formData.tipo === "Fijo" ? 4 : 8}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {formData.tipo === "Fijo" ? (
                      <IconPhone className="h-4 w-4 text-gray-400" />
                    ) : (
                      <>
                        <IconDeviceMobile className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 text-sm mr-1">+569</span>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={formData.numero}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange("numero", value);
                    }}
                    onKeyDown={(e) => {
                      // Bloquear directamente cualquier tecla que no sea número
                      if (
                        !/[0-9]/.test(e.key) &&
                        e.key !== "Backspace" &&
                        e.key !== "Delete" &&
                        e.key !== "Tab" &&
                        e.key !== "ArrowLeft" &&
                        e.key !== "ArrowRight"
                      ) {
                        e.preventDefault();
                      }
                    }}
                    placeholder={formData.tipo === "Fijo" ? "1234" : "68765432"}
                    className={`w-full ${
                      formData.tipo === "Móvil" ? "pl-16" : "pl-10"
                    } pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.numero ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    maxLength={formData.tipo === "Fijo" ? 4 : 8}
                  />
                </div>
                {errors.numero && (
                  <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.tipo === "Fijo"
                    ? "Solo números, entre 3 y 4 dígitos"
                    : "Solo números, 8 dígitos (sin +569)"}
                </p>
              </div>
            </div>
          </div>

          {/* Información de Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-orange-600" />
              Ubicación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dirección */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección *
                  </label>
                  <CharacterCounter
                    current={formData.direccion.length}
                    max={50}
                  />
                </div>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) =>
                    handleInputChange("direccion", e.target.value)
                  }
                  placeholder="Municipal"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.direccion ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                  maxLength={50}
                />
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccion}
                  </p>
                )}
              </div>

              {/* Unidad */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Unidad *
                  </label>
                  <CharacterCounter current={formData.unidad.length} max={50} />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconBuilding className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.unidad}
                    onChange={(e) =>
                      handleInputChange("unidad", e.target.value)
                    }
                    placeholder="Informática"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.unidad ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    maxLength={50}
                  />
                </div>
                {errors.unidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.unidad}</p>
                )}
              </div>

              {/* Ubicación */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ubicación {formData.tipo === "Fijo" && "*"}
                  </label>
                  <CharacterCounter
                    current={formData.ubicacion.length}
                    max={50}
                  />
                </div>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) =>
                    handleInputChange("ubicacion", e.target.value)
                  }
                  placeholder="Oficina 201, Segundo Piso"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.ubicacion ? "border-red-300" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                  maxLength={50}
                />
                {errors.ubicacion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ubicacion}
                  </p>
                )}
                {/* {formData.tipo === "Móvil" && (
                  <p className="mt-1 text-xs text-gray-500">
                    Opcional para números móviles
                  </p>
                )} */}
              </div>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <IconUser className="h-5 w-5 text-purple-600" />
                Usuario(s)
              </h3>
              {formData.tipo === "Fijo" && formData.usuarios.length < 5 && (
                <button
                  type="button"
                  onClick={addUsuario}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  disabled={isLoading}
                >
                  <IconPlus className="h-4 w-4" />
                  Añadir Usuario
                </button>
              )}
            </div>

            {formData.usuarios.map((usuario, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">
                    Usuario {index + 1}
                  </h4>
                  {formData.tipo === "Fijo" && formData.usuarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeUsuario(index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      disabled={isLoading}
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Nombre *
                      </label>
                      <CharacterCounter
                        current={usuario.nombre.length}
                        max={50}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconUser className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={usuario.nombre}
                        onChange={(e) =>
                          handleUsuarioChange(index, "nombre", e.target.value)
                        }
                        placeholder="Juan Pérez"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          errors.usuarios && errors.usuarios[index]
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        maxLength={50}
                      />
                    </div>
                  </div>

                  {/* Cargo */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Cargo {formData.tipo === "Móvil" && "*"}
                      </label>
                      <CharacterCounter
                        current={usuario.cargo.length}
                        max={50}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IconBriefcase className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={usuario.cargo}
                        onChange={(e) =>
                          handleUsuarioChange(index, "cargo", e.target.value)
                        }
                        placeholder="Secretario Municipal"
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                          errors.usuarios && errors.usuarios[index]
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        disabled={isLoading}
                        maxLength={50}
                      />
                    </div>
                    {/* {formData.tipo === "Fijo" && (
                      <p className="mt-1 text-xs text-gray-500">
                        Opcional para números fijos
                      </p>
                    )} */}
                  </div>
                </div>

                {errors.usuarios && errors.usuarios[index] && (
                  <p className="text-sm text-red-600">
                    {errors.usuarios[index]}
                  </p>
                )}
              </div>
            ))}

            {/* {formData.tipo === "Móvil" && (
              <p className="text-xs text-gray-500">
                Los números móviles solo pueden tener un usuario asociado
              </p>
            )} */}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#164e63] text-white rounded-lg hover:bg-[#0f3a47] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Añadiendo...
                </>
              ) : (
                "Añadir Contacto"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
