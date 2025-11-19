import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://aayushhh-operator-rs-backend.hf.space";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-storage");
    console.log("[API Interceptor] Request URL:", config.url);
    console.log("[API Interceptor] Auth storage exists:", !!token);

    if (token) {
      try {
        const parsed = JSON.parse(token);
        console.log("[API Interceptor] Parsed storage:", parsed);
        console.log(
          "[API Interceptor] Token in storage:",
          parsed.state?.token ? "Present" : "Missing"
        );

        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
          console.log("[API Interceptor] Authorization header set");
        } else {
          console.warn("[API Interceptor] No token found in parsed storage");
        }
      } catch (error) {
        console.error("[API Interceptor] Error parsing auth token:", error);
      }
    } else {
      console.warn("[API Interceptor] No auth-storage found in localStorage");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(
      "[API Interceptor] Response success:",
      response.config.url,
      response.status
    );
    return response;
  },
  (error) => {
    console.error(
      "[API Interceptor] Response error:",
      error.config?.url,
      error.response?.status
    );

    if (error.response?.status === 401) {
      console.error("[API Interceptor] 401 Unauthorized - logging out");
      console.error(
        "[API Interceptor] Error response data:",
        error.response?.data
      );
      localStorage.removeItem("auth-storage");
      // Don't redirect immediately - let the component handle it
      // window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  async login(email, password) {
    console.log("[API] Login request:", { email });
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("[API] Login response:", response.data);
      console.log("[API] Login response.data:", response.data.data);
      console.log("[API] Login response.data.user:", response.data.data?.user);
      console.log(
        "[API] Login response.data.token:",
        response.data.data?.token
      );
      console.log("[API] Full response:", response);

      // Handle nested response structure
      const responseData = response.data.data || response.data;
      const user = responseData.user || responseData;
      const token =
        responseData.token ||
        responseData.access_token ||
        responseData.jwt ||
        response.data.token;

      console.log("[API] Extracted user:", user);
      console.log(
        "[API] Extracted token:",
        token ? "Token present" : "Token missing"
      );
      if (token) {
        console.log("[API] Token value:", token.substring(0, 20) + "...");
      }

      return {
        success: true,
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      console.error("[API] Login error:", error);
      console.error("[API] Login error response:", error.response?.data);
      throw error;
    }
  },

  async register(name, email, password) {
    console.log("[API] Register request:", { name, email });
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      console.log("[API] Register response:", response.data);
      console.log("[API] Full response:", response);
      console.log("[API] Response status:", response.status);
      console.log("[API] Response headers:", response.headers);

      // Handle different response structures
      const responseData = response.data;
      const user = responseData.user || responseData;
      const token =
        responseData.token ||
        responseData.access_token ||
        responseData.jwt ||
        responseData.data?.token;

      console.log("[API] Extracted user:", user);
      console.log(
        "[API] Extracted token:",
        token ? "Token present" : "Token missing"
      );

      return {
        success: true,
        data: {
          user,
          token,
        },
      };
    } catch (error) {
      console.error("[API] Register error:", error);
      console.error("[API] Register error response:", error.response?.data);
      console.error("[API] Register error status:", error.response?.status);
      throw error;
    }
  },

  async checkAuth() {
    console.log("[API] CheckAuth request");
    try {
      const response = await api.get("/auth/me");
      console.log("[API] CheckAuth response:", response.data);
      return {
        success: true,
        data: {
          user: response.data.user || response.data,
        },
      };
    } catch (error) {
      console.error("[API] CheckAuth error:", error);
      throw error;
    }
  },
};

// User Profile API
export const userApi = {
  async getProfile() {
    console.log("[API] getProfile request");
    try {
      const response = await api.get("/users/profile");
      console.log("[API] getProfile response:", response);
      console.log("[API] getProfile response.data:", response.data);
      const unwrapped = response.data?.data ?? response.data;
      console.log("[API] getProfile unwrapped:", unwrapped);
      console.log("[API] getProfile techStack:", unwrapped?.techStack);
      console.log("[API] getProfile projects:", unwrapped?.projects);
      return {
        success: true,
        data: unwrapped,
      };
    } catch (error) {
      console.error("[API] getProfile error:", error);
      throw error;
    }
  },

  async updateProfile(profileData) {
    const response = await api.put("/users/profile", profileData);
    const unwrapped = response.data?.data ?? response.data;
    return {
      success: true,
      data: unwrapped,
    };
  },

  async updateTechStack(techStack) {
    console.log("[API] updateTechStack request:", { techStack });
    try {
      const response = await api.put("/users/profile/tech-stack", {
        techStack,
      });
      const unwrapped = response.data?.data ?? response.data;
      console.log("[API] updateTechStack response:", unwrapped);
      return {
        success: true,
        data: unwrapped,
      };
    } catch (error) {
      console.error("[API] updateTechStack error:", error);
      console.error(
        "[API] updateTechStack error response:",
        error.response?.data
      );
      throw error;
    }
  },

  async updateProjects(projects) {
    console.log("[API] updateProjects request:", { projects });
    try {
      const response = await api.put("/users/profile/projects", { projects });
      const unwrapped = response.data?.data ?? response.data;
      console.log("[API] updateProjects response:", unwrapped);
      return {
        success: true,
        data: unwrapped,
      };
    } catch (error) {
      console.error("[API] updateProjects error:", error);
      console.error(
        "[API] updateProjects error response:",
        error.response?.data
      );
      throw error;
    }
  },

  async updateResume(resumeData) {
    console.log("[API] updateResume request:", { resumeData });
    try {
      const response = await api.put("/users/profile/resume", { resumeData });
      const unwrapped = response.data?.data ?? response.data;
      console.log("[API] updateResume response:", unwrapped);
      return {
        success: true,
        data: unwrapped,
      };
    } catch (error) {
      console.error("[API] updateResume error:", error);
      console.error("[API] updateResume error response:", error.response?.data);
      throw error;
    }
  },
};

export default api;
