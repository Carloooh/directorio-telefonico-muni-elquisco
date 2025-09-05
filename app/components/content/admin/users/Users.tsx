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

  // Controlar el overflow del body cuando los modales están abiertos
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
        fetchUsers(); // Recargar la lista
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
        fetchUsers(); // Recargar la lista
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando usuarios...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
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
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">{user.nombre}</td>
                    <td className="px-6 py-4">{user.usuario}</td>
                    <td className="px-6 py-4">{user.email}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRoleColor(
                          user.rol
                        )}`}
                      >
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
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
                          className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <IconEdit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleChangePassword(user)}
                          className="p-1.5 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                          title="Cambiar Contraseña"
                        >
                          <IconKey className="w-5 h-5 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash className="w-5 h-5 text-red-600" />
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Editar Usuario
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditInputChange}
                  required
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  required
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Ej: juan@ejemplo.com"
                />
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={editFormData.rol}
                  onChange={handleEditInputChange}
                  required
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  {/* <option value="Revisor">Revisor</option>
                <option value="Editor">Editor</option>
                <option value="Supervisor">Supervisor</option> */}
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Estado de la Cuenta *
                </label>
                <select
                  name="estado"
                  value={editFormData.estado}
                  onChange={handleEditInputChange}
                  required
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                >
                  <option value="Activa">Activa</option>
                  <option value="Desactivada">Desactivada</option>
                  <option value="Suspendida">Suspendida</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Se enviará una notificación por email
                  si se cambia el email, rol y/o estado de la cuenta.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleCloseEditModal}
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Actualizando..." : "Actualizar Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Confirmar Eliminación
              </h3>
              <button
                onClick={handleCloseDeleteModal}
                className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                ¿Estás seguro de que deseas eliminar al usuario{" "}
                <strong>{selectedUser.nombre}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Esta acción no se puede
                  deshacer. Se eliminarán todos los datos asociados al
                  usuario, incluyendo permisos y registros.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar Usuario"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Cambiar Contraseña
              </h3>
              <button
                onClick={handleClosePasswordModal}
                className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                ¿Estás seguro de que deseas cambiar la contraseña del usuario{" "}
                <strong>{selectedUser.nombre}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
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
                  <li>
                    Se le recomendará al usuario cambiar la contraseña
                    manualmente
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Email del usuario:</strong> {selectedUser.email}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                onClick={handleClosePasswordModal}
                disabled={isChangingPassword}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirmPasswordChange}
                disabled={isChangingPassword}
              >
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
