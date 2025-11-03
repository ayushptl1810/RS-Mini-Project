import { create } from 'zustand';
import { mockRecommendationApi } from '../services/mockApi';

const useRecommendationStore = create((set) => ({
  roleRecommendations: null,
  stackRecommendations: null,
  isLoading: false,
  error: null,

  getRoleRecommendations: async (resumeFile) => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockRecommendationApi.getRoleRecommendations(resumeFile);
      set({ roleRecommendations: result.data, isLoading: false });
      return { success: true, data: result.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  getStackRecommendations: async (role) => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockRecommendationApi.getStackRecommendations(role);
      set({ stackRecommendations: result.data, isLoading: false });
      return { success: true, data: result.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearRoleRecommendations: () => {
    set({ roleRecommendations: null });
  },

  clearStackRecommendations: () => {
    set({ stackRecommendations: null });
  },

  clearAll: () => {
    set({
      roleRecommendations: null,
      stackRecommendations: null,
      error: null,
    });
  },
}));

export default useRecommendationStore;

