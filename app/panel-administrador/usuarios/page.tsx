"use client";

import { useState } from "react";
import Banner from "@/app/components/content/admin/users/Banner";
import Users from "@/app/components/content/admin/users/Users";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";
import { IconUsersGroup, IconInfoCircle } from "@tabler/icons-react";

export default function UsuariosPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUserCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={["Administrador"]}>
        <div className="min-h-screen bg-background py-8">
          <div className="space-y-8 max-w-7xl mx-auto px-4">
            {/* Header Section */}
            <div className="bg-[#164e63] rounded-lg shadow-lg">
              <div className="px-6 py-4 md:py-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mr-4">
                    <IconUsersGroup className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-medium text-white">
                      Gestión de Usuarios
                    </h1>
                    {/* <p className="text-[#E1E5EA] text-lg">
                    Administra los usuarios del sistema, crea nuevos usuarios
                    y gestiona sus permisos.
                  </p> */}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-6">
                <Banner
                  onUserCreated={handleUserCreated}
                  searchTerm={searchTerm}
                  onSearchChange={handleSearchChange}
                />
                <div className="mt-6">
                  <Users
                    searchTerm={searchTerm}
                    refreshTrigger={refreshTrigger}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex flex-row items-center justify-start">
                    <div className="w-7.5 h-7.5">
                      <IconInfoCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Roles de Usuario
                    </h3>
                  </div>
                  <div className="flex flex-col md:flex-row md:gap-6 space-y-3 md:space-y-0 -mt-1">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mr-3 min-w-fit">
                        Administrador
                      </span>
                      <span className="text-sm text-gray-700">
                        Control general
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3 min-w-fit">
                        Editor
                      </span>
                      <span className="text-sm text-gray-700">
                        Administrar contactos
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
