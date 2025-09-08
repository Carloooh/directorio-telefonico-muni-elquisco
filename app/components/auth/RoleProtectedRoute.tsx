"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/",
}: RoleProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      if (!user?.rol || !allowedRoles.includes(user.rol)) {
        router.push(redirectTo);
        return;
      }

      setInitialCheckDone(true);
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router]);

  // Mostrar loading mientras se verifica
  if (isLoading || !initialCheckDone) {
    return (
      <div className="h-dvh flex items-center justify-center relative">
        <div className="h-full w-full absolute inset-0 -z-10 flex flex-col items-center justify-center space-y-5">
          {/* <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #bcf0f4 0, #bcf0f4 2px, transparent 2px, transparent 10px)`,
              backgroundSize: "14px 14px",
              opacity: "0.15",
            }}
          ></div> */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#164e63] text-[#164e63]"></div>
          <span className="text-[#164e63]">Verificando rol</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
