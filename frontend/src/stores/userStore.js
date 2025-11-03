import { create } from "zustand";
import { mockUserApi } from "../services/mockApi";

const useUserStore = create((set, get) => ({
  profile: {
    name: "",
    email: "",
    resumeData: null,
    techStack: [],
    projects: [],
  },
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockUserApi.getProfile();
      set({ profile: result.data, isLoading: false });
      return { success: true, data: result.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockUserApi.updateProfile(profileData);
      set({ profile: result.data, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateTechStack: async (techStack) => {
    set({ error: null });
    try {
      await mockUserApi.updateTechStack(techStack);
      set((state) => ({
        profile: { ...state.profile, techStack },
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  updateProjects: async (projects) => {
    set({ error: null });
    try {
      await mockUserApi.updateProjects(projects);
      set((state) => ({
        profile: { ...state.profile, projects },
      }));
      return { success: true };
    } catch (error) {
      set({ error: error.message });
      return { success: false, error: error.message };
    }
  },

  clearProfile: () => {
    set({
      profile: {
        name: "",
        email: "",
        resumeData: null,
        techStack: [],
        projects: [],
      },
      error: null,
    });
  },
}));

export default useUserStore;
