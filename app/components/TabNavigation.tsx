"use client";

import { useEffect, useState } from "react";

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
}

const TabNavigation = ({
  tabs,
  defaultTab,
  activeTab: externalActiveTab,
  onTabChange,
}: TabNavigationProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultTab || tabs[0]?.id
  );

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
      return "bg-[#164e63] text-white px-4 py-3 rounded-lg transition-all duration-200";
    } else {
      return "text-[#164e63]/80 hover:text-[#164e63] hover:bg-[#164e63]/20 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer";
    }
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-6">
      <div className="w-fit bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden relative">
        <div className="border-1 border-[#164e63]/20 py-2">
          <div className="flex flex-row justify-center md:justify-start mx-1 md:mx-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={getLinkClasses(tab.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="hidden md:block">{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">{activeTabData?.component}</div>
    </div>
  );
};

export default TabNavigation;
