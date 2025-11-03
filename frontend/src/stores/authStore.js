import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockAuthApi } from "../services/mockApi";

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
        set({ isLoading: true });
        try {
          const result = await mockAuthApi.login(email, password);

          set({
            user: result.data.user,
            token: result.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const result = await mockAuthApi.register(name, email, password);

          set({
            user: result.data.user,
            token: result.data.token,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
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
        if (!token) return;

        try {
          const result = await mockAuthApi.checkAuth(token);
          set({ user: result.data.user, isAuthenticated: true });
        } catch (error) {
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
