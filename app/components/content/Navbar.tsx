"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  IconPhone,
  IconUsers,
  IconMenu2,
  IconX,
  IconEye,
  IconEyeOff,
  IconLogout,
  IconLogin,
  IconFilePhone,
  IconSettings,
  IconId,
  IconLockPassword,
  IconMail,
  IconCheck,
} from "@tabler/icons-react";
import { useAuth } from "@/app/hooks/useAuth";

export default function Navbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<"email" | "code" | "success">(
    "email"
  );

  // Estados para el formulario de login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados para reset password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();

  const handleMenuItemClick = () => {
    setShowMenu(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(username, password);
      if (result.success) {
        setShowLoginModal(false);
        setUsername("");
        setPassword("");
        setError("");
        toast.success("Sesión iniciada correctamente");
        router.refresh();
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      setShowMenu(false);
      toast.success("Sesión cerrada correctamente");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  const handleResetPasswordClick = () => {
    setShowResetPassword(true);
  };

  const handleCancelReset = () => {
    setShowResetPassword(false);
    setResetStep("email");
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  // Funciones de validación de contraseña
  const validatePasswordLength = (password: string) => {
    return password.length >= 8 && password.length <= 100;
  };

  const validatePasswordUppercase = (password: string) => {
    return /[A-Z]/.test(password);
  };

  const validatePasswordNumber = (password: string) => {
    return /[0-9]/.test(password);
  };

  const validatePasswordSpecialChar = (password: string) => {
    return /[!@#$%^&*(),.?":{}|<>]/.test(password);
  };

  const isPasswordValid = () => {
    return (
      validatePasswordLength(newPassword) &&
      validatePasswordUppercase(newPassword) &&
      validatePasswordNumber(newPassword) &&
      validatePasswordSpecialChar(newPassword)
    );
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setResetStep("code");
      } else {
        toast.error(data.error || "Error al enviar el código");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setResetLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (!isPasswordValid()) {
      toast.error("La contraseña no cumple con los requisitos");
      return;
    }
    setResetLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setResetStep("success");
      } else {
        toast.error(data.error || "Error al restablecer la contraseña");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setResetLoading(false);
    }
  };

  const closeModal = () => {
    setShowLoginModal(false);
    setShowResetPassword(false);
    setUsername("");
    setPassword("");
    setError("");
    setResetStep("email");
    setEmail("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur">
        <div className="container mx-auto px-4 h-16">
          <div className="flex items-center justify-between h-full">
            {/* Logo y título */}
            <div className="flex items-center gap-3">
              <Link className="flex items-center gap-3" href="/">
                <div className="p-2 rounded-lg bg-[#164e63] text-white">
                  <IconFilePhone size={20} />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-[#475569]">
                    Directorio Telefónico
                  </h1>
                </div>
              </Link>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated && (
                <>
                  {/* <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#475569] hover:bg-[#3b82f6]/10 rounded-lg transition-colors"
                  >
                    <IconPhone size={16} />
                    <span>Gestión números</span>
                  </Link> */}
                  <Link
                    href="/panel-administrador/usuarios"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#475569] hover:bg-[#3b82f6]/10 rounded-lg transition-colors"
                  >
                    <IconUsers size={16} />
                    <span>Gestión usuarios</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Botones de acción */}
            <div className="flex items-center gap-2">
              {!isAuthenticated ? (
                <>
                  {/* Botón iniciar sesión - siempre visible */}
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#164e63] border border-[#164e63] hover:bg-[#164e63] hover:text-white rounded-lg transition-colors"
                  >
                    <IconLogin size={16} />
                    <span>Iniciar Sesión</span>
                  </button>

                  {/* Menú móvil para no autenticados - ELIMINADO COMPLETAMENTE */}
                </>
              ) : (
                <>
                  {/* Botón cerrar sesión móvil */}
                  <button
                    onClick={handleLogout}
                    className="md:hidden flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#164e63] text-white border border-[#164e63] hover:bg-transparent hover:text-[#164e63] rounded-lg transition-colors"
                  >
                    <IconLogout size={16} />
                    <span>Cerrar Sesión</span>
                  </button>

                  {/* Botón cerrar sesión desktop */}
                  <button
                    onClick={handleLogout}
                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#164e63] text-white border border-[#164e63] hover:bg-transparent hover:text-[#164e63] rounded-lg transition-colors"
                  >
                    <IconLogout size={16} />
                    <span>Cerrar Sesión</span>
                  </button>

                  {/* Menú móvil para autenticados */}
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="md:hidden p-2 text-[#64748b] hover:text-[#475569] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                  >
                    {showMenu ? <IconX size={20} /> : <IconMenu2 size={20} />}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Menú móvil desplegable - Solo se muestra si está autenticado */}
          {isAuthenticated && (
            <div
              className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border border-gray-200 rounded-lg shadow-lg z-50 relative ${
                showMenu ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="py-2">
                <div className="space-y-1">
                  {/* <Link
                    href="/"
                    onClick={handleMenuItemClick}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#64748b] hover:bg-[#f3f4f6] hover:text-[#475569] transition-colors"
                  >
                    <IconPhone size={16} />
                    Gestión números
                  </Link> */}
                  <Link
                    href="/panel-administrador/usuarios"
                    onClick={handleMenuItemClick}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-[#64748b] hover:bg-[#f3f4f6] hover:text-[#475569] transition-colors"
                  >
                    <IconUsers size={16} />
                    Gestión usuarios
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Línea decorativa centrada */}
        <div className="flex justify-center py-1">
          <div className="w-3/4 h-px bg-[#e1e3e5]"></div>
        </div>
      </header>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#e5e7eb]">
              <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-[#025964] text-white">
                    <IconLogin size={20} />
                  </div>
                  <h2 className="text-xl font-semibold text-[#393b3d]">
                    {showResetPassword
                      ? "Recuperar Contraseña"
                      : "Iniciar Sesión"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-[#64748b] hover:text-[#475569] hover:bg-[#f3f4f6] rounded-lg transition-colors"
                >
                  <IconX size={20} />
                </button>
              </div>

              <div className="p-6">
                {!showResetPassword ? (
                  // Formulario de Login
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Usuario
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IconId className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          autoComplete="username"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={isLoading}
                          className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#538D97] text-sm disabled:bg-gray-100"
                          placeholder="Ingrese su nombre de usuario"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Contraseña
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IconLockPassword className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoading}
                          className="appearance-none block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#538D97] text-sm disabled:bg-gray-100"
                          placeholder="Ingrese su contraseña"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <IconEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <IconEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      {error && (
                        <div className="mt-2 text-[#ed616d] text-sm">
                          {error}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#025964] disabled:opacity-50"
                      >
                        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                      </button>
                      <div className="flex items-center justify-center">
                        <div className="text-sm">
                          <button
                            type="button"
                            onClick={handleResetPasswordClick}
                            disabled={isLoading}
                            className="font-medium text-[#025964] hover:text-[#2A737D]"
                          >
                            Restablecer contraseña
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  // Formulario de Reset Password
                  <div>
                    {resetStep === "email" && (
                      <>
                        <p className="text-[#393b3d] mb-4 text-sm">
                          Ingrese su correo electrónico y le enviaremos un
                          código para restablecer su contraseña.
                        </p>
                        <form
                          onSubmit={handleEmailSubmit}
                          className="space-y-4"
                        >
                          <div>
                            <label
                              htmlFor="email"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Correo Electrónico
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconMail className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-sm"
                                placeholder="Ingrese su correo electrónico"
                                disabled={resetLoading}
                              />
                            </div>
                          </div>
                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={handleCancelReset}
                              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:opacity-50"
                              disabled={resetLoading}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97] disabled:opacity-50"
                              disabled={resetLoading}
                            >
                              {resetLoading ? "Enviando..." : "Enviar"}
                            </button>
                          </div>
                        </form>
                      </>
                    )}

                    {resetStep === "code" && (
                      <>
                        <p className="text-[#393b3d] mb-4 text-sm">
                          Ingrese el código que recibió y su nueva contraseña.
                        </p>
                        <form onSubmit={handleCodeSubmit} className="space-y-3">
                          <div>
                            <label
                              htmlFor="code"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Código de Verificación
                            </label>
                            <div className="mt-1">
                              <input
                                id="code"
                                name="code"
                                type="text"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="appearance-none block w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-sm text-center font-mono tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                disabled={resetLoading}
                              />
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                Ingrese el código de 6 dígitos enviado a {email}
                              </p>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="newPassword"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Nueva Contraseña
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconLockPassword className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="newPassword"
                                name="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-sm pr-10"
                                placeholder="Ingrese su nueva contraseña"
                                disabled={resetLoading}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? (
                                  <IconEyeOff className="h-4 w-4" />
                                ) : (
                                  <IconEye className="h-4 w-4" />
                                )}
                              </button>
                            </div>

                            {/* Indicadores de validación de contraseña */}
                            <div className="mt-1 space-y-1">
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs">
                                <div className="flex items-center space-x-1">
                                  {newPassword.length === 0 ? (
                                    <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                                  ) : validatePasswordLength(newPassword) ? (
                                    <IconCheck className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <IconX className="w-3 h-3 text-red-500" />
                                  )}
                                  <span
                                    className={`${
                                      newPassword.length === 0
                                        ? "text-gray-500"
                                        : validatePasswordLength(newPassword)
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    8-100 caracteres
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  {newPassword.length === 0 ? (
                                    <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                                  ) : validatePasswordUppercase(newPassword) ? (
                                    <IconCheck className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <IconX className="w-3 h-3 text-red-500" />
                                  )}
                                  <span
                                    className={`${
                                      newPassword.length === 0
                                        ? "text-gray-500"
                                        : validatePasswordUppercase(newPassword)
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    1 mayúscula
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  {newPassword.length === 0 ? (
                                    <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                                  ) : validatePasswordNumber(newPassword) ? (
                                    <IconCheck className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <IconX className="w-3 h-3 text-red-500" />
                                  )}
                                  <span
                                    className={`${
                                      newPassword.length === 0
                                        ? "text-gray-500"
                                        : validatePasswordNumber(newPassword)
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    1 número
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1">
                                  {newPassword.length === 0 ? (
                                    <div className="w-3 h-3 rounded-full border border-gray-300"></div>
                                  ) : validatePasswordSpecialChar(
                                      newPassword
                                    ) ? (
                                    <IconCheck className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <IconX className="w-3 h-3 text-red-500" />
                                  )}
                                  <span
                                    className={`${
                                      newPassword.length === 0
                                        ? "text-gray-500"
                                        : validatePasswordSpecialChar(
                                            newPassword
                                          )
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    1 especial
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="confirmPassword"
                              className="block text-sm font-medium text-gray-700"
                            >
                              Confirmar Contraseña
                            </label>
                            <div className="mt-1 relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IconLockPassword className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                value={confirmPassword}
                                onChange={(e) =>
                                  setConfirmPassword(e.target.value)
                                }
                                className="appearance-none block w-full px-3 py-2.5 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-sm pr-10"
                                placeholder="Confirme su nueva contraseña"
                                disabled={resetLoading}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? (
                                  <IconEyeOff className="h-4 w-4" />
                                ) : (
                                  <IconEye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            {confirmPassword.length > 0 && (
                              <div className="mt-1 flex items-center space-x-1 text-xs">
                                {newPassword === confirmPassword ? (
                                  <>
                                    <IconCheck className="w-3 h-3 text-green-500" />
                                    <span className="text-green-600">
                                      Las contraseñas coinciden
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <IconX className="w-3 h-3 text-red-500" />
                                    <span className="text-red-600">
                                      Las contraseñas no coinciden
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex space-x-4">
                            <button
                              type="button"
                              onClick={() => setResetStep("email")}
                              className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:opacity-50"
                              disabled={resetLoading}
                            >
                              Volver
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97] disabled:opacity-50"
                              disabled={resetLoading}
                            >
                              {resetLoading ? "Restableciendo..." : "Confirmar"}
                            </button>
                          </div>
                        </form>
                      </>
                    )}

                    {resetStep === "success" && (
                      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                        <h3 className="font-medium mb-2">
                          ¡Contraseña Restablecida!
                        </h3>
                        <p className="text-sm">
                          Tu contraseña ha sido restablecida exitosamente. Ya
                          puedes iniciar sesión con tu nueva contraseña.
                        </p>
                        <div className="mt-4">
                          <button
                            onClick={handleCancelReset}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97]"
                          >
                            Volver al inicio de sesión
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
