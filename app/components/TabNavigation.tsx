"use client";

import { useEffect, useState, useRef } from "react";

interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (newTabId: string, oldTabId: string) => void;
  defaultMessage?: {
    title: string;
    description: string;
  };
}

const TabNavigation = ({
  tabs,
  defaultTab,
  activeTab: externalActiveTab,
  onTabChange,
  defaultMessage,
}: TabNavigationProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || "default"
  );
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  // Usar activeTab externo si se proporciona, sino usar el interno
  const activeTab =
    externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;

  const handleTabChange = (newTabId: string) => {
    const oldTabId = activeTab;

    // Llamar al callback antes de cambiar la pestaña
    if (onTabChange) {
      onTabChange(newTabId, oldTabId);
    }

    // Solo actualizar estado interno si no hay control externo
    if (externalActiveTab === undefined) {
      setInternalActiveTab(newTabId);
    }
  };

  const getLinkClasses = (tabId: string) => {
    if (activeTab === tabId) {
      return "bg-[#164e63] text-white px-4 py-3 rounded-lg transition-all duration-200 flex-shrink-0";
    } else {
      return "text-[#164e63]/80 hover:text-[#164e63] hover:bg-[#164e63]/20 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer flex-shrink-0";
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  // Componente por defecto cuando no hay tab seleccionada
  const DefaultContent = () => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {defaultMessage?.title || "Seleccione una opción"}
      </h2>
      <p className="text-gray-600">
        {defaultMessage?.description ||
          "Seleccione una pestaña para comenzar a navegar por la página del gestor listados de información"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden relative">
        <div className="border-1 border-[#164e63]/20 py-2">
          {/* Contenedor con scroll horizontal en móviles */}
          <div
            ref={tabsContainerRef}
            className="flex flex-row overflow-x-auto scrollbar-hide md:overflow-visible md:justify-start mx-1 md:mx-2 gap-1"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={getLinkClasses(tab.id)}
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="hidden md:block">{tab.icon}</span>
                  <span className="text-sm md:text-base">{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTabData?.component || <DefaultContent />}
      </div>
    </div>
  );
};

export default TabNavigation;
