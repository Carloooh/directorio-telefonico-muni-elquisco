"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import {
  IconUser,
  IconEdit,
  IconCheck,
  IconX,
  IconEye,
  IconEyeX,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import ProtectedRoute from "../components/auth/ProtectedRoute";

export default function PerfilPage() {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userRut, setUserRut] = useState("");

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Cargar datos completos del usuario (incluyendo RUT)
  const fetchUserData = async () => {
    if (!token || !user?.id) return;

    try {
      const response = await fetch("/api/usuarios");
      const data = await response.json();
      if (response.ok) {
        const currentUser = data.users.find((u: any) => u.id === user.id);
        if (currentUser) {
          setUserRut(currentUser.rut || "");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Validar contraseña
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Validar que las contraseñas coincidan
  const validatePasswordsMatch = (): boolean => {
    return (
      formData.newPassword === formData.confirmPassword &&
      formData.confirmPassword.length > 0
    );
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    // Validar contraseñas si se están cambiando
    const isChangingPassword =
      formData.currentPassword ||
      formData.newPassword ||
      formData.confirmPassword;

    if (isChangingPassword) {
      if (!formData.currentPassword) {
        toast.error("Debes ingresar tu contraseña actual");
        return;
      }
      if (!formData.newPassword) {
        toast.error("Debes ingresar una nueva contraseña");
        return;
      }
      if (!validatePassword(formData.newPassword)) {
        toast.error("La nueva contraseña debe tener al menos 6 caracteres");
        return;
      }
      if (!validatePasswordsMatch()) {
        toast.error("Las contraseñas no coinciden");
        return;
      }
    }

    setIsUpdating(true);

    try {
      // Actualizar información básica (solo email)
      const profileResponse = await fetch("/api/usuarios", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          nombre: user.nombre,
          rol: user.rol,
          estado: "Activa",
        }),
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        toast.error(profileData.error || "Error al actualizar perfil");
        return;
      }

      // Cambiar contraseña si se proporcionó
      if (isChangingPassword) {
        const passwordResponse = await fetch(
          "/api/usuarios/change-own-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user.id,
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            }),
          }
        );

        const passwordData = await passwordResponse.json();

        if (!passwordResponse.ok) {
          toast.error(passwordData.error || "Error al cambiar contraseña");
          return;
        }

        toast.success("Perfil y contraseña actualizados exitosamente");
      } else {
        toast.success("Perfil actualizado exitosamente");
      }

      setIsEditing(false);
      // Recargar la página para actualizar el contexto de usuario
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Iniciar edición
  const handleEdit = async () => {
    setIsEditing(true);
    await fetchUserData();
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      {!user ? (
        <div className="min-h-screen bg-background py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#164e63]"></div>
          <span className="ml-2 text-[#164e63]">Cargando perfil...</span>
        </div>
      ) : (
        <div className="min-h-screen bg-background py-8">
          <div className="space-y-8 max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="bg-[#164e63] rounded-lg shadow-lg">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <IconUser className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-medium text-white">
                      Mi Perfil
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-y-4 md:gap-y-0">
                <h2 className="text-xl font-medium text-gray-900">
                  Información Personal
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-[#015762] text-white rounded-lg hover:bg-[#014a54] transition-colors"
                  >
                    <IconEdit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSubmit}
                      disabled={isUpdating}
                      className="flex items-center px-4 py-2 bg-[#015762] text-white rounded-lg hover:bg-[#014a54] transition-colors disabled:opacity-50"
                    >
                      <IconCheck className="w-4 h-4 mr-2" />
                      {isUpdating ? "Guardando..." : "Guardar"}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                      <IconX className="w-4 h-4 mr-2" />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                /* Formulario de edición */
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Información básica */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Información de Contacto
                    </h3>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="border border-gray-300 rounded-lg p-3 focus:ring-[#015762] focus:border-[#015762] transition-colors"
                          placeholder="Ej: juan@ejemplo.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cambio de contraseña */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Cambiar Contraseña
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Deja estos campos vacíos si no deseas cambiar tu
                      contraseña.
                    </p>
                    <div className="space-y-4">
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contraseña Actual
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            className="border border-gray-300 rounded-lg p-3 pr-10 focus:ring-[#015762] focus:border-[#015762] transition-colors w-full"
                            placeholder="Ingresa tu contraseña actual"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? (
                              <IconEyeX className="h-5 w-5" />
                            ) : (
                              <IconEye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleInputChange}
                              className="border border-gray-300 rounded-lg p-3 pr-10 focus:ring-[#015762] focus:border-[#015762] transition-colors w-full"
                              placeholder="Mínimo 6 caracteres"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? (
                                <IconEyeX className="h-5 w-5" />
                              ) : (
                                <IconEye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Nueva Contraseña
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              className={`border rounded-lg p-3 pr-10 focus:ring-[#015762] focus:border-[#015762] transition-colors w-full ${
                                formData.confirmPassword &&
                                !validatePasswordsMatch()
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="Repite la nueva contraseña"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? (
                                <IconEyeX className="h-5 w-5" />
                              ) : (
                                <IconEye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                          {formData.confirmPassword &&
                            !validatePasswordsMatch() && (
                              <span className="text-red-500 text-sm mt-1">
                                Las contraseñas no coinciden
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Nota:</strong> Al actualizar tu email, recibirás
                      una notificación de confirmación. Si cambias tu
                      contraseña, deberás usar la nueva contraseña en tu próximo
                      inicio de sesión.
                    </p>
                  </div>
                </form>
              ) : (
                /* Vista de solo lectura */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        {user.nombre}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        {user.email}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuario
                      </label>
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        {user.usuario}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.rol === "Administrador"
                              ? "bg-purple-100 text-purple-800"
                              : user.rol === "Supervisor"
                              ? "bg-yellow-100 text-yellow-800"
                              : user.rol === "Editor"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.rol}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
