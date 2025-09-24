"use client";
import { useState, useEffect } from "react";
import {
  IconX,
  IconPhone,
  IconDeviceMobile,
  IconMapPin,
  IconBuildings,
  IconBuilding,
  IconUser,
  IconBriefcase,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconChevronDown,
} from "@tabler/icons-react";
import { useAuth } from "@/app/hooks/useAuth";
import toast from "react-hot-toast";

interface Direction {
  nombre: string;
  sigla?: string;
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

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
  direcciones: Direction[];
  unidades: Unit[];
  ubicaciones: Location[];
  cargos: Job[];
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
  sigla: string;
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
  direcciones = [],
  unidades = [],
  ubicaciones = [],
  cargos = [],
}: AddContactModalProps) {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showDirecciones, setShowDirecciones] = useState(false);
  const [showSiglas, setShowSiglas] = useState(false);
  const [showUnidades, setShowUnidades] = useState(false);
  const [showUbicaciones, setShowUbicaciones] = useState(false);
  const [showCargos, setShowCargos] = useState<boolean[]>([]);
  const [formData, setFormData] = useState<FormData>({
    numero: "",
    tipo: "Fijo",
    direccion: "",
    unidad: "",
    ubicacion: "",
    sigla: "",
    usuarios: [{ nombre: "", cargo: "" }],
  });

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar direcciones basado en el input de dirección
  const filteredDirecciones = direcciones.filter((dir) => {
    const searchTerm = normalizeText(formData.direccion);
    return (
      normalizeText(dir.nombre).includes(searchTerm) ||
      (dir.sigla && normalizeText(dir.sigla).includes(searchTerm))
    );
  });

  // Filtrar siglas basado en el input de sigla
  const filteredSiglas = direcciones
    .filter((dir) => dir.sigla)
    .filter((dir) => {
      const searchTerm = normalizeText(formData.sigla);
      return (
        normalizeText(dir.sigla!).includes(searchTerm) ||
        normalizeText(dir.nombre).includes(searchTerm)
      );
    })
    .map((dir) => ({ sigla: dir.sigla!, direccion: dir.nombre }));

  // Filtrar unidades
  const filteredUnidades = unidades.filter((unit) =>
    normalizeText(unit.nombre).includes(normalizeText(formData.unidad))
  );

  // Filtrar ubicaciones
  const filteredUbicaciones = ubicaciones.filter((ubic) =>
    normalizeText(ubic.nombre).includes(normalizeText(formData.ubicacion))
  );

  // Filtrar cargos para cada usuario
  const getFilteredCargos = (cargoValue: string) => {
    return cargos.filter((cargo) =>
      normalizeText(cargo.nombre).includes(normalizeText(cargoValue))
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".combobox-container")) {
        setShowDirecciones(false);
        setShowSiglas(false);
        setShowUnidades(false);
        setShowUbicaciones(false);
        setShowCargos([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Inicializar showCargos cuando cambie el número de usuarios
  useEffect(() => {
    setShowCargos(new Array(formData.usuarios.length).fill(false));
  }, [formData.usuarios.length]);

  // Mostrar dropdowns automáticamente al escribir
  useEffect(() => {
    if (formData.direccion.length > 0) {
      setShowDirecciones(true);
    }
  }, [formData.direccion]);

  useEffect(() => {
    if (formData.sigla.length > 0) {
      setShowSiglas(true);
    }
  }, [formData.sigla]);

  // Enlace bidireccional al escribir coincidencias exactas (sin obligar a clic)
  useEffect(() => {
    if (!formData.direccion) return;
    const match = direcciones.find(
      (d) => normalizeText(d.nombre) === normalizeText(formData.direccion)
    );
    if (match) {
      setFormData((prev) =>
        prev.sigla === (match.sigla || "")
          ? prev
          : { ...prev, sigla: match.sigla || "" }
      );
    }
  }, [formData.direccion, direcciones]);

  useEffect(() => {
    if (!formData.sigla) return;
    const match = direcciones.find(
      (d) => d.sigla && normalizeText(d.sigla) === normalizeText(formData.sigla)
    );
    if (match) {
      setFormData((prev) =>
        prev.direccion === match.nombre
          ? prev
          : { ...prev, direccion: match.nombre }
      );
    }
  }, [formData.sigla, direcciones]);

  useEffect(() => {
    if (formData.unidad.length > 0) {
      setShowUnidades(true);
    }
  }, [formData.unidad]);

  useEffect(() => {
    if (formData.ubicacion.length > 0) {
      setShowUbicaciones(true);
    }
  }, [formData.ubicacion]);

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

    // Validar dirección
    if (!formData.direccion.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    // Validar unidad
    if (!formData.unidad.trim()) {
      newErrors.unidad = "La unidad es requerida";
    }

    // Validar ubicación
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
      onContactAdded();
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
      sigla: "",
      usuarios: [{ nombre: "", cargo: "" }],
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      numero: "",
      usuarios: [{ nombre: "", cargo: "" }],
      ubicacion: newTipo === "Móvil" ? "" : prev.ubicacion,
    }));
  };

  // Seleccionar dirección y auto-completar sigla
  const selectDireccion = (direccion: string) => {
    const direccionSeleccionada = direcciones.find(
      (dir) => dir.nombre === direccion
    );

    setFormData((prev) => ({
      ...prev,
      direccion: direccion,
      sigla: direccionSeleccionada?.sigla || prev.sigla,
    }));
    setShowDirecciones(false);
  };

  // Seleccionar sigla y auto-completar dirección
  const selectSigla = (sigla: string, direccion: string) => {
    setFormData((prev) => ({
      ...prev,
      sigla: sigla,
      direccion: direccion,
    }));
    setShowSiglas(false);
  };

  const selectUnidad = (unidad: string) => {
    handleInputChange("unidad", unidad);
    setShowUnidades(false);
  };

  const selectUbicacion = (ubicacion: string) => {
    handleInputChange("ubicacion", ubicacion);
    setShowUbicaciones(false);
  };

  // Seleccionar cargo para un usuario específico
  const selectCargo = (cargo: string, usuarioIndex: number) => {
    handleUsuarioChange(usuarioIndex, "cargo", cargo);
    const newShowCargos = [...showCargos];
    newShowCargos[usuarioIndex] = false;
    setShowCargos(newShowCargos);
  };

  const toggleCargoDropdown = (index: number) => {
    const newShowCargos = [...showCargos];
    newShowCargos[index] = !newShowCargos[index];
    setShowCargos(newShowCargos);
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
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange("numero", value);
                    }}
                    onKeyDown={(e) => {
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
                    ? "Solo números, 4 dígitos"
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
              {/* Dirección - MUESTRA DIRECCIONES */}
              <div className="combobox-container relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección *
                  </label>
                  <CharacterCounter
                    current={formData.direccion.length}
                    max={50}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconBuildings className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) =>
                      handleInputChange("direccion", e.target.value)
                    }
                    onBlur={() => setShowDirecciones(false)}
                    onFocus={() =>
                      formData.direccion.length > 0 && setShowDirecciones(true)
                    }
                    onClick={() => setShowDirecciones(true)}
                    placeholder="Municipal"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.direccion ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowDirecciones(!showDirecciones)}
                  >
                    <IconChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {showDirecciones && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredDirecciones.length > 0 ? (
                        filteredDirecciones.map((dir, index) => (
                          <div
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectDireccion(dir.nombre);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          >
                            <span>{dir.nombre}</span>
                            {dir.sigla && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {dir.sigla}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No se encontraron direcciones con este nombre
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.direccion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.direccion}
                  </p>
                )}
              </div>

              {/* Sigla - MUESTRA SIGLAS */}
              <div className="combobox-container relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sigla
                  </label>
                  <CharacterCounter current={formData.sigla.length} max={15} />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconBuildings className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.sigla}
                    onChange={(e) => handleInputChange("sigla", e.target.value)}
                    onBlur={() => setShowSiglas(false)}
                    onFocus={() =>
                      formData.sigla.length > 0 && setShowSiglas(true)
                    }
                    onClick={() => setShowSiglas(true)}
                    placeholder="Ej: DOM, DIMAO, etc."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    disabled={isLoading}
                    maxLength={15}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowSiglas(!showSiglas)}
                  >
                    <IconChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {showSiglas && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredSiglas.length > 0 ? (
                        filteredSiglas.map((item, index) => (
                          <div
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectSigla(item.sigla, item.direccion);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center gap-4"
                          >
                            <span className="text-sm font-medium flex-shrink-0">
                              {item.sigla}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-auto">
                              {item.direccion}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No se encontraron siglas con este texto
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Campo opcional. Se conecta automáticamente con la dirección.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unidad */}
              <div className="combobox-container relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Unidad/Departamento *
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
                    onBlur={() => setShowUnidades(false)}
                    onFocus={() =>
                      formData.unidad.length > 0 && setShowUnidades(true)
                    }
                    onClick={() => setShowUnidades(true)}
                    placeholder="Administración"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.unidad ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowUnidades(!showUnidades)}
                  >
                    <IconChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {showUnidades && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredUnidades.length > 0 ? (
                        filteredUnidades.map((unit, index) => (
                          <div
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectUnidad(unit.nombre);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {unit.nombre}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No se encontraron unidades con este nombre
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.unidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.unidad}</p>
                )}
              </div>

              {/* Ubicación */}
              <div className="combobox-container relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ubicación {formData.tipo === "Fijo" ? "*" : ""}
                  </label>
                  <CharacterCounter
                    current={formData.ubicacion.length}
                    max={50}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconMapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) =>
                      handleInputChange("ubicacion", e.target.value)
                    }
                    onBlur={() => setShowUbicaciones(false)}
                    onFocus={() =>
                      formData.ubicacion.length > 0 && setShowUbicaciones(true)
                    }
                    onClick={() => setShowUbicaciones(true)}
                    placeholder="Oficina 101"
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.ubicacion ? "border-red-300" : "border-gray-300"
                    }`}
                    disabled={isLoading}
                    maxLength={50}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowUbicaciones(!showUbicaciones)}
                  >
                    <IconChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {showUbicaciones && (
                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                      {filteredUbicaciones.length > 0 ? (
                        filteredUbicaciones.map((ubic, index) => (
                          <div
                            key={index}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectUbicacion(ubic.nombre);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {ubic.nombre}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm">
                          No se encontraron ubicaciones con este nombre
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.ubicacion && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ubicacion}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Usuarios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <IconUser className="h-5 w-5 text-purple-600" />
                Usuarios
              </h3>
              {formData.tipo === "Fijo" && (
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

            <div className="space-y-4">
              {formData.usuarios.map((usuario, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    {formData.usuarios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeUsuario(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
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
                      {errors.usuarios && errors.usuarios[index] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.usuarios[index]}
                        </p>
                      )}
                    </div>

                    {/* Cargo - MUESTRA CARGOS */}
                    <div className="combobox-container relative">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Cargo {formData.tipo === "Móvil" ? "*" : ""}
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
                          onBlur={() => {
                            const newShowCargos = [...showCargos];
                            newShowCargos[index] = false;
                            setShowCargos(newShowCargos);
                          }}
                          onFocus={() => {
                            if (usuario.cargo.length > 0) {
                              const newShowCargos = [...showCargos];
                              newShowCargos[index] = true;
                              setShowCargos(newShowCargos);
                            }
                          }}
                          onClick={() => toggleCargoDropdown(index)}
                          placeholder="Director, Secretario, etc."
                          className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                            errors.usuarios && errors.usuarios[index]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          disabled={isLoading}
                          maxLength={50}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 flex items-center pr-3"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => toggleCargoDropdown(index)}
                        >
                          <IconChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        {showCargos[index] && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                            {getFilteredCargos(usuario.cargo).length > 0 ? (
                              getFilteredCargos(usuario.cargo).map(
                                (cargo, cargoIndex) => (
                                  <div
                                    key={cargoIndex}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      selectCargo(cargo.nombre, index);
                                    }}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    {cargo.nombre}
                                  </div>
                                )
                              )
                            ) : (
                              <div className="px-4 py-2 text-gray-500 text-sm">
                                No se encontraron cargos con este nombre
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[#164e63] text-white border border-[#164e63] hover:bg-transparent hover:text-[#164e63] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
