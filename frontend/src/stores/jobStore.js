import { create } from 'zustand';
import { mockJobApi } from '../services/mockApi';

const useJobStore = create((set, get) => ({
  jobs: [],
  personalizedJobs: [],
  filters: {
    search: '',
    location: '',
    remote: false,
    experienceLevel: '',
    techStack: [],
  },
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,

  fetchJobs: async (personalized = false) => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockJobApi.getJobs(personalized);
      const jobs = result.data.jobs || [];
      
      if (personalized) {
        set({ personalizedJobs: jobs, isLoading: false });
      } else {
        set({ jobs: jobs, isLoading: false });
      }

      return { success: true, data: result.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  fetchJobDetails: async (jobId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await mockJobApi.getJobDetails(jobId);
      set({ isLoading: false });
      return { success: true, data: result.data };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  updateFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        search: '',
        location: '',
        remote: false,
        experienceLevel: '',
        techStack: [],
      },
    });
  },

  getFilteredJobs: () => {
    const state = get();
    const jobs = state.personalizedJobs.length > 0 
      ? state.personalizedJobs 
      : state.jobs;

    return jobs.filter(job => {
      const { search, location, remote, experienceLevel, techStack } = state.filters;

      if (search && !job.title.toLowerCase().includes(search.toLowerCase()) &&
          !job.company.toLowerCase().includes(search.toLowerCase()) &&
          !job.description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      if (location && job.location && !job.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      if (remote && !job.isRemote) {
        return false;
      }

      if (experienceLevel && job.experienceLevel !== experienceLevel) {
        return false;
      }

      if (techStack.length > 0) {
        const jobStack = job.techStack || [];
        const hasMatchingTech = techStack.some(tech => 
          jobStack.some(jobTech => 
            jobTech.toLowerCase().includes(tech.toLowerCase())
          )
        );
        if (!hasMatchingTech) return false;
      }

      return true;
    });
  },

  clearJobs: () => {
    set({
      jobs: [],
      personalizedJobs: [],
      error: null,
    });
  },
}));

export default useJobStore;

