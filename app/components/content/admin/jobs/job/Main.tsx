"use client";

import { useState } from "react";
import Banner from "@/app/components/content/admin/jobs/job/Banner";
import JobContent from "@/app/components/content/admin/jobs/job/Content";

export default function CargosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <div className="min-h-screen bg-background py-2">
        <div className="space-y-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow border border-gray-200 pt-3 px-6 pb-3 md:p-6">
            <Banner
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onRefresh={handleRefresh}
            />
            <JobContent
              searchTerm={searchTerm}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>
    </>
  );
}
