import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../services/api";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setHasHydrated: () => {
        set({ hasHydrated: true });
      },

      login: async (email, password) => {
        console.log("[AuthStore] Login called:", { email });
        set({ isLoading: true });
        try {
          const result = await authApi.login(email, password);
          console.log("[AuthStore] Login result:", result);
          console.log("[AuthStore] Login result.data:", result.data);
          console.log("[AuthStore] Login result.data.user:", result.data.user);
          console.log(
            "[AuthStore] Login result.data.token:",
            result.data.token ? "Token present" : "Token missing"
          );

          if (!result.data.token) {
            console.warn("[AuthStore] No token in result.data!");
            console.warn(
              "[AuthStore] Full result.data:",
              JSON.stringify(result.data, null, 2)
            );
          }

          const tokenToSet = result.data.token;
          const userToSet = result.data.user;

          console.log(
            "[AuthStore] About to set state with token:",
            tokenToSet ? "Present" : "Missing"
          );

          set({
            user: userToSet,
            token: tokenToSet,
            isAuthenticated: !!tokenToSet,
            isLoading: false,
          });

          console.log(
            "[AuthStore] State set, current token:",
            useAuthStore.getState().token ? "Present" : "Missing"
          );

          // Wait a bit for persist middleware to save to localStorage
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Verify token was saved
          const stored = localStorage.getItem("auth-storage");
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log(
              "[AuthStore] Token saved to localStorage:",
              parsed.state?.token ? "Yes" : "No"
            );
            console.log("[AuthStore] Parsed storage state:", parsed.state);
          } else {
            console.error("[AuthStore] No auth-storage found in localStorage!");
          }

          return { success: true };
        } catch (error) {
          console.error("[AuthStore] Login error:", error);
          set({ isLoading: false });
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message ||
            "Login failed";
          return { success: false, error: errorMessage };
        }
      },

      register: async (name, email, password) => {
        console.log("[AuthStore] Register called:", { name, email });
        set({ isLoading: true });
        try {
          const result = await authApi.register(name, email, password);
          console.log("[AuthStore] Register result:", result);
          console.log("[AuthStore] Register result.data:", result.data);
          console.log("[AuthStore] Register user:", result.data.user);
          console.log(
            "[AuthStore] Register token:",
            result.data.token ? "Token present" : "Token missing"
          );

          if (!result.data.user) {
            console.warn("[AuthStore] No user in response!");
          }
          if (!result.data.token) {
            console.warn("[AuthStore] No token in response!");
          }

          set({
            user: result.data.user,
            token: result.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Wait a bit for persist middleware to save to localStorage
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Verify token was saved
          const stored = localStorage.getItem("auth-storage");
          if (stored) {
            const parsed = JSON.parse(stored);
            console.log(
              "[AuthStore] Token saved to localStorage:",
              parsed.state?.token ? "Yes" : "No"
            );
          }

          console.log("[AuthStore] State updated successfully");
          return { success: true };
        } catch (error) {
          console.error("[AuthStore] Register error:", error);
          console.error(
            "[AuthStore] Register error response:",
            error.response?.data
          );
          set({ isLoading: false });
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.message ||
            "Registration failed";
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        const token = useAuthStore.getState().token;
        console.log("[AuthStore] CheckAuth called, token exists:", !!token);

        if (!token) {
          console.log("[AuthStore] No token, skipping checkAuth");
          return;
        }

        try {
          console.log("[AuthStore] Calling authApi.checkAuth()");
          const result = await authApi.checkAuth();
          console.log("[AuthStore] CheckAuth result:", result);
          set({ user: result.data.user, isAuthenticated: true });
        } catch (error) {
          console.error("[AuthStore] CheckAuth error:", error);
          console.error(
            "[AuthStore] CheckAuth error response:",
            error.response?.data
          );
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;
