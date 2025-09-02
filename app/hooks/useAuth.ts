"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPayload } from "@/app/lib/auth";
import { useAuth as useAuthContext } from "@/app/contexts/AuthContext";

interface AuthState {
  user: UserPayload | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = useAuthContext;
