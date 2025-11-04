import { useEffect, useState, useRef } from "react";
import useUserStore from "../stores/userStore";
import TechStackBadge from "../components/ui/TechStackBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  uploadImageToCloudinary,
  uploadDocumentToCloudinary,
} from "../services/cloudinaryService";
import {
  PlusIcon,
  TrashIcon,
  UserCircleIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon,
  CheckBadgeIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const {
    profile,
    fetchProfile,
    updateTechStack,
    updateProjects,
    updateName,
    updateEmail,
    updateAvatar,
    updateResume,
    isLoading,
  } = useUserStore();
  const [editingStack, setEditingStack] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile.name) setTempName(profile.name);
    if (profile.email) setTempEmail(profile.email);
  }, [profile.name, profile.email]);

  const handleSaveName = async () => {
    if (tempName.trim() && tempName !== profile.name) {
      await updateName(tempName.trim());
    }
    setEditingName(false);
  };

  const handleCancelName = () => {
    setTempName(profile.name);
    setEditingName(false);
  };

  const handleSaveEmail = async () => {
    if (tempEmail.trim() && tempEmail !== profile.email) {
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(tempEmail.trim())) {
        await updateEmail(tempEmail.trim());
        setEditingEmail(false);
      } else {
        alert("Please enter a valid email address");
      }
    } else {
      setEditingEmail(false);
    }
  };

  const handleCancelEmail = () => {
    setTempEmail(profile.email);
    setEditingEmail(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const result = await uploadImageToCloudinary(file);
      await updateAvatar(result.url);
    } catch (error) {
      console.error("Avatar upload error:", error);
      alert(`Failed to upload avatar: ${error.message}`);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".pdf", ".doc", ".docx"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      alert("Please select a valid resume file (PDF, DOC, or DOCX)");
      return;
    }

    // Validate file size (max 10MB for resumes)
    if (file.size > 10 * 1024 * 1024) {
      alert("Resume size should be less than 10MB");
      return;
    }

    setUploadingResume(true);
    try {
      const result = await uploadDocumentToCloudinary(file);
      await updateResume({
        url: result.url,
        filename: result.filename,
        size: result.size,
        type: result.type,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error("Resume upload error:", error);
      alert(`Failed to upload resume: ${error.message}`);
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    }
  };

  const handleResumeClick = () => {
    resumeInputRef.current?.click();
  };

  const handleAddTech = () => {
    if (newTech.trim() && !profile.techStack.includes(newTech.trim())) {
      const updatedStack = [...profile.techStack, newTech.trim()];
      updateTechStack(updatedStack);
      setNewTech("");
    }
  };

  const handleRemoveTech = (tech) => {
    const updatedStack = profile.techStack.filter((t) => t !== tech);
    updateTechStack(updatedStack);
  };

  const handleAddProject = () => {
    if (newProjectName.trim() && newProjectDesc.trim()) {
      const updatedProjects = [
        ...profile.projects,
        { name: newProjectName.trim(), description: newProjectDesc.trim() },
      ];
      updateProjects(updatedProjects);
      setNewProjectName("");
      setNewProjectDesc("");
      setShowAddProject(false);
    }
  };

  const handleRemoveProject = (index) => {
    const updatedProjects = profile.projects.filter((_, i) => i !== index);
    updateProjects(updatedProjects);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      label: "Technologies",
      value: profile.techStack.length,
      icon: SparklesIcon,
    },
    { label: "Projects", value: profile.projects.length, icon: BriefcaseIcon },
    {
      label: "Resume",
      value: profile.resumeData ? "Uploaded" : "None",
      icon: AcademicCapIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border border-gray-800 rounded-3xl shadow-2xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur-md opacity-50" />
                  <div className="relative bg-gray-950 border-2 border-cyan-500/30 rounded-full overflow-hidden">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.name || "Profile"}
                        className="h-20 w-20 object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="h-20 w-20 text-cyan-400" />
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <LoadingSpinner size="sm" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full p-2 border-2 border-gray-950 hover:scale-110 transition-transform disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    title="Change avatar"
                  >
                    <CameraIcon className="h-4 w-4 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  {editingName ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") handleCancelName();
                        }}
                        className="text-3xl md:text-4xl font-extrabold bg-gray-900/50 border border-cyan-500 rounded-lg px-3 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="text-green-400 hover:text-green-300 p-1 cursor-pointer"
                      >
                        <CheckIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleCancelName}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                        {profile.name || "Your Profile"}
                      </h1>
                      <button
                        onClick={() => setEditingName(true)}
                        className="text-gray-500 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
                        title="Edit name"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSaveEmail();
                          if (e.key === "Escape") handleCancelEmail();
                        }}
                        className="text-gray-400 bg-gray-900/50 border border-cyan-500 rounded-lg px-3 py-1 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEmail}
                        className="text-green-400 hover:text-green-300 p-1 cursor-pointer"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancelEmail}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-400 flex items-center gap-2 mt-2">
                      <span>{profile.email || "No email set"}</span>
                      <button
                        onClick={() => setEditingEmail(true)}
                        className="text-gray-600 hover:text-cyan-400 transition-colors p-1 cursor-pointer"
                        title="Edit email"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {profile.resumeData && (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckBadgeIcon className="h-4 w-4" />
                          Verified
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-gray-950/50 border border-gray-800 rounded-xl px-6 py-4 text-center group hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className="flex justify-center mb-2">
                      <stat.icon className="h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tech Stack Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border border-gray-800 rounded-3xl shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SparklesIcon className="h-6 w-6 text-cyan-400" />
                Tech Stack
              </h2>
              <button
                onClick={() => setEditingStack(!editingStack)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-sm font-semibold cursor-pointer"
              >
                {editingStack ? "Done" : "Edit"}
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mb-6 min-h-[100px]">
              {profile.techStack.length > 0 ? (
                profile.techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <TechStackBadge
                      tech={tech}
                      onClick={
                        editingStack ? () => handleRemoveTech(tech) : undefined
                      }
                    />
                    {editingStack && (
                      <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrashIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  No technologies added yet
                </p>
              )}
            </div>

            {editingStack && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTech()}
                  placeholder="Add technology..."
                  className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={handleAddTech}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border border-gray-800 rounded-3xl shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <BriefcaseIcon className="h-6 w-6 text-cyan-400" />
                Projects
              </h2>
              <button
                onClick={() => setShowAddProject(!showAddProject)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm font-semibold cursor-pointer"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add</span>
              </button>
            </div>

            {showAddProject && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-6 bg-gray-900/50 rounded-2xl border border-gray-700"
              >
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="w-full mb-3 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Project description..."
                  rows="2"
                  className="w-full mb-3 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddProject}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 font-semibold cursor-pointer"
                  >
                    Save Project
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProject(false);
                      setNewProjectName("");
                      setNewProjectDesc("");
                    }}
                    className="px-4 py-3 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-all duration-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {profile.projects.length > 0 ? (
                profile.projects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-lg mb-2">
                          {project.name}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveProject(index)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BriefcaseIcon className="h-16 w-16 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No projects added yet</p>
                  <p className="text-gray-600 text-sm mt-2">
                    Showcase your work to potential employers
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black border border-gray-800 rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleResumeClick}
              disabled={uploadingResume}
              className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl hover:border-blue-500 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-300 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                  {uploadingResume ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">
                    {uploadingResume
                      ? "Uploading Resume..."
                      : profile.resumeData
                      ? "Update Resume"
                      : "Upload Resume"}
                  </div>
                  <div className="text-sm text-gray-400">
                    {uploadingResume
                      ? "Please wait..."
                      : profile.resumeData
                      ? "Update your resume"
                      : "Get role recommendations"}
                  </div>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-cyan-400">→</span>
            </button>
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />

            <button className="flex items-center justify-between p-6 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl hover:border-cyan-500 hover:from-cyan-600/30 hover:to-blue-600/30 transition-all duration-300 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">
                    Get Recommendations
                  </div>
                  <div className="text-sm text-gray-400">
                    Discover your perfect role
                  </div>
                </div>
              </div>
              <span className="text-gray-400 group-hover:text-cyan-400">→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
