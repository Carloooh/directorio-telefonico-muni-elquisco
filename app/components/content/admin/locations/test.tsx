"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";

export default function Test() {
  const params = useParams();
  const direccionId = params.id as string;
  const { token, user } = useAuth();
  const { loading, setLoading } = useState(true);
  const { error, setError } = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Items Presupuestarios - Gestión Interna
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#025964]"></div>
          <span className="ml-2 text-gray-600">Cargando items...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Items Presupuestarios - Gestión Interna
        </h2>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error: {error}</div>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[#025964] text-white rounded-md hover:bg-[#024a52]"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <IconCurrencyDollar className="h-6 w-6 mr-2 text-[#025964]" />
                Items Presupuestarios - Gestión Interna
              </h2>
              <p className="text-sm text-gray-600 mt-1">Año</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
