"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  IconBuildings,
  IconCategory,
  IconMapPin,
  IconLocationCog,
} from "@tabler/icons-react";
import TabNavigation from "@/app/components/TabNavigation";
import Test from "@/app/components/content/admin/locations/test";
import HistoryGestionComponent from "@/app/components/content/admin/locations/test";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";

export default function GestionInternaDetallePage() {
  const params = useParams();

  const tabs = [
    {
      id: "direcciones",
      name: "Direcciones",
      icon: <IconBuildings size={20} />,
      component: <Test />,
    },
    {
      id: "unidades",
      name: "Unidades",
      icon: <IconCategory size={20} />,
      component: <Test />,
    },
    {
      id: "ubicaciones",
      name: "Ubicaciones",
      icon: <IconMapPin size={20} />,
      component: <Test />,
    },
  ];

  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={["Administrador"]}>
        <div className="min-h-screen bg-background py-8">
          <div className="space-y-8 max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="bg-[#164e63] text-white rounded-lg shadow-lg">
              <div className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                    <IconLocationCog className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-xl font-medium text-white">
                      Gestión Ubicaciones
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Sistema de Tabs */}
            <TabNavigation tabs={tabs} defaultTab="items" />
          </div>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
