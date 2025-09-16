"use client";

import { IconEdit, IconTrash, IconKey } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/useAuth";

interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  usuario: string;
}

interface UsersProps {
  searchTerm: string;
  refreshTrigger: number;
}

// Componente para mostrar contador de caracteres
const CharacterCounter = ({ current, max }: { current: number; max: number }) => {
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

const Users = ({ searchTerm, refreshTrigger }: UsersProps) => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    estado: "",
  });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/usuarios");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error("Error al cargar usuarios");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rol.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  useEffect(() => {
    if (showEditModal || showDeleteModal || showPasswordModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showEditModal, showDeleteModal, showPasswordModal]);

  const handleEditUser = async (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
    });
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name !== "rut") {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsUpdating(true);

    try {
      const response = await fetch("/api/usuarios", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedUser.id,
          ...editFormData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario actualizado exitosamente");
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Error al actualizar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/usuarios?id=${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuario eliminado exitosamente");
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        toast.error(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePassword = (user: User) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const handleConfirmPasswordChange = async () => {
    if (!selectedUser) return;

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/usuarios/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setShowPasswordModal(false);
        setSelectedUser(null);
      } else {
        toast.error(data.error || "Error al cambiar contraseña");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    setEditFormData({
      nombre: "",
      email: "",
      rol: "",
      estado: "",
    });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Administrador":
        return "bg-purple-100 text-purple-800";
      case "Supervisor":
        return "bg-red-100 text-red-800";
      case "Editor":
        return "bg-green-100 text-green-800";
      case "Revisor":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activa":
        return "bg-green-100 text-green-800";
      case "Desactivada":
        return "bg-red-100 text-red-800";
      case "Suspendida":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-base font-medium tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-base font-medium tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-base font-medium tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-base font-medium tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-base font-medium tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-base font-medium tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No se encontraron usuarios que coincidan con la búsqueda"
                      : "No hay usuarios registrados"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4 text-gray-900">{user.usuario}</td>
                    <td className="px-6 py-4 text-gray-900">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                          user.rol
                        )}`}
                      >
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          user.estado
                        )}`}
                      >
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Cambiar Contraseña"
                        >
                          <IconKey className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            style={{ scrollbarGutter: "stable" }}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Editar Usuario
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isUpdating}
              >
                <IconEdit className="h-5 w-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre Completo *
                  </label>
                  <CharacterCounter current={editFormData.nombre.length} max={100} />
                </div>
                <input
                  type="text"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditInputChange}
                  maxLength={100}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ej: Juan Pérez"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <CharacterCounter current={editFormData.email.length} max={100} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  maxLength={100}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Ej: juan@ejemplo.com"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={editFormData.rol}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isUpdating}
                >
                  <option value="Editor">Editor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de la Cuenta *
                </label>
                <select
                  name="estado"
                  value={editFormData.estado}
                  onChange={handleEditInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={isUpdating}
                >
                  <option value="Activa">Activa</option>
                  <option value="Desactivada">Desactivada</option>
                  <option value="Suspendida">Suspendida</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Se enviará una notificación por email
                  si se cambia el email, rol y/o estado de la cuenta.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#164e63] rounded-lg hover:bg-[#475569] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isUpdating}
                >
                  {isUpdating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {isUpdating ? "Actualizando..." : "Actualizar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Confirmar Eliminación
              </h2>
              <button
                onClick={handleCloseDeleteModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                <IconTrash className="h-5 w-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que deseas eliminar al usuario{" "}
                <strong>{selectedUser.nombre}</strong>?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Esta acción no se puede
                  deshacer. Se eliminarán todos los datos asociados al usuario,
                  incluyendo permisos y registros.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isDeleting ? "Eliminando..." : "Eliminar Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Cambiar Contraseña
              </h2>
              <button
                onClick={handleClosePasswordModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isChangingPassword}
              >
                <IconKey className="h-5 w-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que deseas cambiar la contraseña del usuario{" "}
                <strong>{selectedUser.nombre}</strong>?
              </p>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Información:</strong>
                </p>
                <ul className="text-sm text-yellow-800 mt-2 list-disc list-inside">
                  <li>
                    Se generará una nueva contraseña temporal automáticamente
                  </li>
                  <li>
                    La contraseña será encriptada y almacenada de forma segura
                  </li>
                  <li>
                    Se enviará un email al usuario con la nueva contraseña
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isChangingPassword}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmPasswordChange}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={isChangingPassword}
              >
                {isChangingPassword && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isChangingPassword ? "Cambiando..." : "Cambiar Contraseña"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Users;
