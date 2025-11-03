// Mock API service that simulates backend responses
// Replace these functions with actual API calls when backend is ready

const MOCK_DELAY = 1000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAuthApi = {
  async login(email, password) {
    await delay(MOCK_DELAY);

    if (email === "test@example.com" && password === "password") {
      return {
        success: true,
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: email,
          },
          token: "mock_jwt_token_" + Date.now(),
        },
      };
    }
    throw new Error("Invalid email or password");
  },

  async register(name, email, password) {
    await delay(MOCK_DELAY);

    if (email && password && name) {
      return {
        success: true,
        data: {
          user: {
            id: Date.now().toString(),
            name,
            email,
          },
          token: "mock_jwt_token_" + Date.now(),
        },
      };
    }
    throw new Error("Registration failed");
  },

  async checkAuth(token) {
    await delay(500);
    if (token) {
      return {
        success: true,
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
          },
        },
      };
    }
    throw new Error("Not authenticated");
  },
};

const mockRecommendationApi = {
  async getRoleRecommendations(resumeFile) {
    await delay(MOCK_DELAY * 2);

    return {
      success: true,
      data: {
        recommendations: [
          {
            role: "Full Stack Developer",
            confidence: 0.95,
            description: "Strong fit based on your experience",
          },
          {
            role: "Backend Developer",
            confidence: 0.88,
            description: "Good match for your skills",
          },
          {
            role: "Software Engineer",
            confidence: 0.82,
            description: "Well-suited position",
          },
          {
            role: "DevOps Engineer",
            confidence: 0.75,
            description: "Consider expanding your cloud skills",
          },
          {
            role: "Data Engineer",
            confidence: 0.68,
            description: "Could be a good fit with additional training",
          },
        ],
        uploadedResume: {
          filename: resumeFile.name,
          size: resumeFile.size,
          type: resumeFile.type,
        },
      },
    };
  },

  async getStackRecommendations(role) {
    await delay(MOCK_DELAY * 2);

    const roleStackMap = {
      "Full Stack Developer": {
        stack: [
          {
            tech: "React",
            priority: "Critical",
            description: "Modern UI framework",
          },
          {
            tech: "Node.js",
            priority: "Critical",
            description: "Backend runtime",
          },
          {
            tech: "PostgreSQL",
            priority: "Important",
            description: "Relational database",
          },
          {
            tech: "TypeScript",
            priority: "Important",
            description: "Type-safe JavaScript",
          },
          {
            tech: "Docker",
            priority: "Nice to have",
            description: "Containerization",
          },
          {
            tech: "AWS",
            priority: "Nice to have",
            description: "Cloud platform",
          },
        ],
      },
      "Backend Developer": {
        stack: [
          {
            tech: "Python",
            priority: "Critical",
            description: "Main language",
          },
          {
            tech: "FastAPI",
            priority: "Critical",
            description: "Web framework",
          },
          { tech: "PostgreSQL", priority: "Critical", description: "Database" },
          {
            tech: "MongoDB",
            priority: "Important",
            description: "NoSQL database",
          },
          {
            tech: "Redis",
            priority: "Important",
            description: "Caching layer",
          },
          {
            tech: "Docker/Kubernetes",
            priority: "Important",
            description: "Container orchestration",
          },
        ],
      },
      "Data Scientist": {
        stack: [
          {
            tech: "Python",
            priority: "Critical",
            description: "Primary language",
          },
          {
            tech: "Pandas",
            priority: "Critical",
            description: "Data manipulation",
          },
          {
            tech: "Scikit-learn",
            priority: "Critical",
            description: "Machine learning",
          },
          {
            tech: "TensorFlow",
            priority: "Important",
            description: "Deep learning",
          },
          {
            tech: "Jupyter",
            priority: "Important",
            description: "Interactive notebooks",
          },
          {
            tech: "SQL",
            priority: "Important",
            description: "Database queries",
          },
        ],
      },
    };

    const defaultStack = {
      stack: [
        {
          tech: "TBD",
          priority: "Research",
          description: "Specific requirements vary by role",
        },
      ],
    };

    const result = roleStackMap[role] || defaultStack;

    return {
      success: true,
      data: {
        role,
        ...result,
        learningResources: [
          {
            title: "Official Documentation",
            url: `https://example.com/${role}`,
          },
          { title: "Udemy Course", url: "https://example.com/udemy" },
          { title: "YouTube Playlist", url: "https://example.com/youtube" },
        ],
      },
    };
  },
};

const mockJobApi = {
  async getJobs(personalized = false) {
    await delay(MOCK_DELAY);

    const allJobs = [
      {
        id: "1",
        title: "Senior Full Stack Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        isRemote: true,
        experienceLevel: "Senior",
        description:
          "We are looking for an experienced Full Stack Developer to join our team...",
        techStack: ["React", "Node.js", "PostgreSQL", "AWS"],
        postedDate: "2024-01-15",
        salary: "$120,000 - $180,000",
      },
      {
        id: "2",
        title: "Backend Engineer",
        company: "DataFlow Inc",
        location: "New York, NY",
        isRemote: false,
        experienceLevel: "Mid-level",
        description: "Join our backend team to build scalable APIs...",
        techStack: ["Python", "FastAPI", "MongoDB", "Docker"],
        postedDate: "2024-01-14",
        salary: "$100,000 - $140,000",
      },
      {
        id: "3",
        title: "Frontend Developer",
        company: "StartupX",
        location: "Remote",
        isRemote: true,
        experienceLevel: "Junior",
        description: "Looking for a creative frontend developer...",
        techStack: ["React", "TypeScript", "Tailwind CSS"],
        postedDate: "2024-01-13",
        salary: "$80,000 - $120,000",
      },
      {
        id: "4",
        title: "DevOps Engineer",
        company: "CloudServices",
        location: "Seattle, WA",
        isRemote: true,
        experienceLevel: "Mid-level",
        description: "Manage our cloud infrastructure...",
        techStack: ["AWS", "Docker", "Kubernetes", "Terraform"],
        postedDate: "2024-01-12",
        salary: "$110,000 - $150,000",
      },
      {
        id: "5",
        title: "Machine Learning Engineer",
        company: "AIFuture",
        location: "Boston, MA",
        isRemote: false,
        experienceLevel: "Senior",
        description: "Build and deploy ML models...",
        techStack: ["Python", "TensorFlow", "PyTorch", "AWS"],
        postedDate: "2024-01-11",
        salary: "$140,000 - $200,000",
      },
      {
        id: "6",
        title: "Data Scientist",
        company: "AnalyticsPro",
        location: "Remote",
        isRemote: true,
        experienceLevel: "Mid-level",
        description: "Analyze complex datasets and build insights...",
        techStack: ["Python", "Pandas", "SQL", "Tableau"],
        postedDate: "2024-01-10",
        salary: "$105,000 - $145,000",
      },
    ];

    // For personalized jobs, filter based on user's tech stack (mock logic)
    const personalizedJobs = personalized ? allJobs.slice(0, 3) : allJobs;

    return {
      success: true,
      data: {
        jobs: personalized ? personalizedJobs : allJobs,
        total: personalized ? personalizedJobs.length : allJobs.length,
      },
    };
  },

  async getJobDetails(jobId) {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: {
        id: jobId,
        title: "Senior Full Stack Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        isRemote: true,
        experienceLevel: "Senior",
        description:
          "We are looking for an experienced Full Stack Developer to join our dynamic team. You will be responsible for designing, developing, and maintaining web applications using modern technologies.",
        techStack: ["React", "Node.js", "PostgreSQL", "AWS"],
        postedDate: "2024-01-15",
        salary: "$120,000 - $180,000",
        requirements: [
          "5+ years of experience in full-stack development",
          "Proficiency in React and Node.js",
          "Experience with PostgreSQL databases",
          "Knowledge of cloud platforms (AWS preferred)",
        ],
        benefits: [
          "Health insurance",
          "401(k) matching",
          "Flexible work hours",
          "Remote work option",
        ],
      },
    };
  },
};

const mockUserApi = {
  async getProfile() {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: {
        name: "Test User",
        email: "test@example.com",
        resumeData: null,
        techStack: ["React", "Python", "Node.js"],
        projects: [
          {
            name: "E-commerce Platform",
            description: "Full-stack e-commerce solution",
          },
          {
            name: "Task Management App",
            description: "React-based task manager",
          },
        ],
      },
    };
  },

  async updateProfile(profileData) {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: profileData,
    };
  },

  async updateTechStack(techStack) {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: { techStack },
    };
  },

  async updateProjects(projects) {
    await delay(MOCK_DELAY);
    return {
      success: true,
      data: { projects },
    };
  },
};

export { mockAuthApi, mockRecommendationApi, mockJobApi, mockUserApi };
