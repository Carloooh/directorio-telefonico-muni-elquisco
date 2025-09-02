"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      if (requiredRole && user?.rol !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      setInitialCheckDone(true);
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  // Mostrar loading mientras se verifica
  if (isLoading || !initialCheckDone) {
    return (
      <div className="h-dvh flex items-center justify-center relative">
        <div className="h-full w-full absolute inset-0 -z-10 bg-[#24555f]">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #bcf0f4 0, #bcf0f4 2px, transparent 2px, transparent 10px)`,
              backgroundSize: "14px 14px",
              opacity: "0.15",
            }}
          ></div>
        </div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00D47E]"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
