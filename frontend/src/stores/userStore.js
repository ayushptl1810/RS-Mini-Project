import { create } from "zustand";
import { userApi } from "../services/api";
import useAuthStore from "./authStore";

const useUserStore = create((set, get) => ({
  profile: {
    name: "",
    email: "",
    avatar: null,
    resumeData: null,
    techStack: [],
    projects: [],
  },
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    console.log("[UserStore] FetchProfile called");
    set({ isLoading: true, error: null });

    // Get auth store user data as fallback
    const authUser = useAuthStore.getState().user;
    console.log("[UserStore] Auth store user:", authUser);

    try {
      const result = await userApi.getProfile();
      console.log("[UserStore] FetchProfile success:", result);
      console.log("[UserStore] Profile data from backend:", result.data);

      // Normalize profile data - merge backend data with auth store data as fallback
      // Handle arrays properly - preserve arrays, convert null/undefined to empty array
      const techStack = Array.isArray(result.data.techStack)
        ? result.data.techStack
        : result.data.techStack == null
        ? []
        : [];
      const projects = Array.isArray(result.data.projects)
        ? result.data.projects
        : result.data.projects == null
        ? []
        : [];

      console.log(
        "[UserStore] Raw techStack from backend:",
        result.data.techStack
      );
      console.log("[UserStore] Normalized techStack:", techStack);
      console.log(
        "[UserStore] Raw projects from backend:",
        result.data.projects
      );
      console.log("[UserStore] Normalized projects:", projects);

      const normalizedProfile = {
        // Include all backend data first
        ...result.data,
        // Then ensure arrays exist and are properly formatted
        techStack,
        projects,
        resumeData: result.data.resumeData ?? null,
        // Use auth store data as fallback if backend doesn't provide these fields (only for null/undefined, not empty string)
        name: result.data.name ?? authUser?.name ?? "",
        email: result.data.email ?? authUser?.email ?? "",
        avatar: result.data.avatar ?? authUser?.avatar ?? null,
      };

      console.log("[UserStore] Normalized profile:", normalizedProfile);
      console.log(
        "[UserStore] Final techStack in profile:",
        normalizedProfile.techStack
      );
      console.log(
        "[UserStore] Final projects in profile:",
        normalizedProfile.projects
      );
      set({ profile: normalizedProfile, isLoading: false });
      return { success: true, data: normalizedProfile };
    } catch (error) {
      console.error("[UserStore] FetchProfile error:", error);
      console.error(
        "[UserStore] FetchProfile error status:",
        error.response?.status
      );

      // Handle 401 - user is not authenticated
      if (error.response?.status === 401) {
        console.error("[UserStore] 401 Unauthorized - logging out user");
        // Clear auth store
        useAuthStore.getState().logout();
      }

      // If fetch fails but we have auth user data, use that as fallback
      if (authUser) {
        console.log("[UserStore] Using auth store data as fallback");
        const fallbackProfile = {
          name: authUser.name || "",
          email: authUser.email || "",
          avatar: authUser.avatar || null,
          techStack: [],
          projects: [],
          resumeData: null,
        };
        set({ profile: fallbackProfile, isLoading: false });
        return {
          success: false,
          error: "Using cached data",
          data: fallbackProfile,
        };
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to fetch profile";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Initialize profile from auth store (useful after login)
  initializeFromAuth: () => {
    const authUser = useAuthStore.getState().user;
    if (authUser) {
      console.log(
        "[UserStore] Initializing profile from auth store:",
        authUser
      );
      set((state) => ({
        profile: {
          ...state.profile,
          name: authUser.name || state.profile.name || "",
          email: authUser.email || state.profile.email || "",
          avatar: authUser.avatar || state.profile.avatar || null,
        },
      }));
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await userApi.updateProfile(profileData);
      set({ profile: { ...get().profile, ...result.data }, isLoading: false });
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update profile";
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateName: async (name) => {
    set({ error: null });
    try {
      const result = await userApi.updateProfile({ name });
      set((state) => ({
        profile: { ...state.profile, name: result.data.name || name },
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update name";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateEmail: async (email) => {
    set({ error: null });
    try {
      const result = await userApi.updateProfile({ email });
      set((state) => ({
        profile: { ...state.profile, email: result.data.email || email },
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update email";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateAvatar: async (avatarUrl) => {
    set({ error: null });
    try {
      const result = await userApi.updateProfile({ avatar: avatarUrl });
      set((state) => ({
        profile: { ...state.profile, avatar: result.data.avatar || avatarUrl },
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update avatar";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateResume: async (resumeData) => {
    set({ error: null });
    try {
      const result = await userApi.updateResume(resumeData);
      set((state) => ({
        profile: {
          ...state.profile,
          resumeData: result.data.resumeData || resumeData,
        },
      }));
      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update resume";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateTechStack: async (techStack) => {
    console.log("[UserStore] updateTechStack called with:", techStack);
    set({ error: null });
    try {
      const result = await userApi.updateTechStack(techStack);
      console.log("[UserStore] updateTechStack success:", result);
      console.log("[UserStore] updateTechStack response data:", result.data);

      // Update state with response data - handle arrays properly
      const updatedTechStack = Array.isArray(result.data.techStack)
        ? result.data.techStack
        : techStack;

      set((state) => ({
        profile: {
          ...state.profile,
          techStack: updatedTechStack,
        },
      }));

      console.log("[UserStore] Tech stack updated in state:", updatedTechStack);

      // Removed refetch to avoid extra page load on each addition
      // await get().fetchProfile();

      return { success: true };
    } catch (error) {
      console.error("[UserStore] updateTechStack error:", error);
      console.error(
        "[UserStore] updateTechStack error response:",
        error.response?.data
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update tech stack";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  updateProjects: async (projects) => {
    console.log("[UserStore] updateProjects called with:", projects);
    set({ error: null });
    try {
      const result = await userApi.updateProjects(projects);
      console.log("[UserStore] updateProjects success:", result);
      console.log("[UserStore] updateProjects response data:", result.data);

      // Update state with response data - handle arrays properly
      const updatedProjects = Array.isArray(result.data.projects)
        ? result.data.projects
        : projects;

      set((state) => ({
        profile: {
          ...state.profile,
          projects: updatedProjects,
        },
      }));

      console.log("[UserStore] Projects updated in state:", updatedProjects);

      // Removed refetch to avoid extra page load on each addition
      // await get().fetchProfile();

      return { success: true };
    } catch (error) {
      console.error("[UserStore] updateProjects error:", error);
      console.error(
        "[UserStore] updateProjects error response:",
        error.response?.data
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.message ||
        "Failed to update projects";
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  clearProfile: () => {
    set({
      profile: {
        name: "",
        email: "",
        avatar: null,
        resumeData: null,
        techStack: [],
        projects: [],
      },
      error: null,
    });
  },
}));

export default useUserStore;
