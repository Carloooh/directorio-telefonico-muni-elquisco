"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { UserPayload } from "@/app/lib/auth";

interface AuthState {
  user: UserPayload | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (
    usuario: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Función para verificar token (sin logout automático)
  const verifySession = useCallback(async (shouldLogoutOnError = false) => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      if (shouldLogoutOnError) {
        logout();
      }
      return false;
    }

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        if (shouldLogoutOnError) {
          logout();
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verificando sesión:", error);
      // Solo hacer logout en errores críticos y si se especifica
      if (shouldLogoutOnError) {
        logout();
      }
      return false;
    }
  }, []);

  // Verificación inicial
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
          user: null,
          token: null,
        }));
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            user: data.user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Solo limpiar estado, no hacer logout agresivo
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
          localStorage.removeItem("auth_token");
        }
      } catch (error) {
        console.error("Error en verificación inicial:", error);
        // En caso de error de red, mantener el token pero marcar como no autenticado temporalmente
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    };

    checkAuth();
  }, []);

  // Verificación automática en eventos del navegador (menos agresiva)
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        // Solo verificar, no hacer logout automático
        const isValid = await verifySession(false);
        if (!isValid) {
          console.warn("Sesión inválida detectada en visibilitychange");
        }
      }
    };

    const handleFocus = async () => {
      // Solo verificar, no hacer logout automático
      const isValid = await verifySession(false);
      if (!isValid) {
        console.warn("Sesión inválida detectada en focus");
      }
    };

    // Verificación periódica cada 30 minutos (con logout en caso de error)
    const intervalId = setInterval(async () => {
      const isValid = await verifySession(true);
      if (!isValid) {
        console.warn("Sesión expirada en verificación periódica");
      }
    }, 30 * 60 * 1000); // 30 minutos

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [authState.isAuthenticated, verifySession]);

  const login = useCallback(async (usuario: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, contraseña: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("auth_token", data.token);
        setAuthState({
          user: data.user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
