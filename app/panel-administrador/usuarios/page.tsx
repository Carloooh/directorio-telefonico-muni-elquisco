"use client";

import { useState } from "react";
import Banner from "@/app/components/content/admin/users/Banner";
import Users from "@/app/components/content/admin/users/Users";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
