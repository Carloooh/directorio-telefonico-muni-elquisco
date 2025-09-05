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
      <div className="space-y-6 min-w-full max-w-full flex flex-col justify-center items-center">
        <div className="bg-[#015762] rounded-lg shadow pt-3 px-6 pb-3 md:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center mr-4">
              <IconUsersGroup className="w-6 h-6 text-[#F5F7F9]" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-[#F5F7F9] mb-1">
                Usuarios
              </h1>
              <p className="text-[#E1E5EA]">
                Esta es la página de gestión de usuarios. Aquí se mostrará el
                contenido relacionado con los usuarios del sistema.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 pt-3 px-6 pb-3 md:p-6">
          <Banner
            onUserCreated={handleUserCreated}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
          <Users searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
