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
import UnitMain from "@/app/components/content/admin/locations/unit/Main";
import DirectionMain from "@/app/components/content/admin/locations/direction/Main";
import LocationMain from "@/app/components/content/admin/locations/location/Main";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";

export default function GestionInternaDetallePage() {
  const params = useParams();

  const tabs = [
    {
      id: "direcciones",
      name: "Direcciones",
      icon: <IconBuildings size={20} />,
      component: <DirectionMain />,
    },
    {
      id: "unidades",
      name: "Unidades",
      icon: <IconCategory size={20} />,
      component: <UnitMain />,
    },
    {
      id: "ubicaciones",
      name: "Ubicaciones",
      icon: <IconMapPin size={20} />,
      component: <LocationMain />,
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

            <TabNavigation tabs={tabs} defaultTab="items" />
          </div>
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
