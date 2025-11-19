import { create } from "zustand";
import {
  parseResumeWithExternal,
  recommendJobsWithExternal,
  listJobTitlesExternal,
  jobTitleTechStackExternal,
} from "../services/recommenderApi";

const useRecommendationStore = create((set) => ({
  roleRecommendations: null, // { extracted_skills: [...] }
  jobRecommendations: null, // { skills, skills_text, matches: [...] }
  jobTitles: [], // ["Full Stack Developer", ...]
  titleTechStack: null, // { title, tech_stack: [...] }
  isLoading: false,
  error: null,

  getRoleRecommendations: async (resumeFile) => {
    console.log("[RecommendationStore] getRoleRecommendations START", {
      name: resumeFile?.name,
      size: resumeFile?.size,
      type: resumeFile?.type,
    });
    set({ isLoading: true, error: null });
    try {
      const data = await parseResumeWithExternal(resumeFile);
      console.log("[RecommendationStore] getRoleRecommendations SUCCESS", data);
      set({ roleRecommendations: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error(
        "[RecommendationStore] getRoleRecommendations ERROR",
        error
      );
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  getJobRecommendations: async (techArray) => {
    console.log("[RecommendationStore] getJobRecommendations START", {
      techArray,
    });
    set({ isLoading: true, error: null });
    try {
      const data = await recommendJobsWithExternal(techArray);
      console.log("[RecommendationStore] getJobRecommendations SUCCESS", data);
      set({ jobRecommendations: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error("[RecommendationStore] getJobRecommendations ERROR", error);
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchJobTitles: async () => {
    console.log("[RecommendationStore] fetchJobTitles START");
    set({ isLoading: true, error: null });
    try {
      const data = await listJobTitlesExternal();
      const titlesObj = data?.titles || {};
      const titles = Array.isArray(titlesObj)
        ? titlesObj
        : Object.values(titlesObj);
      console.log("[RecommendationStore] fetchJobTitles SUCCESS", titles);
      set({ jobTitles: titles, isLoading: false });
      return { success: true, data: titles };
    } catch (error) {
      console.error("[RecommendationStore] fetchJobTitles ERROR", error);
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchTitleTechStack: async (title) => {
    console.log("[RecommendationStore] fetchTitleTechStack START", { title });
    set({ isLoading: true, error: null });
    try {
      const data = await jobTitleTechStackExternal(title);
      console.log("[RecommendationStore] fetchTitleTechStack SUCCESS", data);
      set({ titleTechStack: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      console.error("[RecommendationStore] fetchTitleTechStack ERROR", error);
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  clearRoleRecommendations: () => {
    console.log("[RecommendationStore] clearRoleRecommendations");
    set({ roleRecommendations: null });
  },

  clearJobRecommendations: () => {
    console.log("[RecommendationStore] clearJobRecommendations");
    set({ jobRecommendations: null });
  },

  clearTitleTechStack: () => {
    console.log("[RecommendationStore] clearTitleTechStack");
    set({ titleTechStack: null });
  },

  clearAll: () => {
    console.log("[RecommendationStore] clearAll");
    set({
      roleRecommendations: null,
      jobRecommendations: null,
      jobTitles: [],
      titleTechStack: null,
      error: null,
    });
  },
}));

export default useRecommendationStore;
