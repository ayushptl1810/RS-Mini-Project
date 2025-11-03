import { useEffect, useState } from "react";
import useUserStore from "../stores/userStore";
import TechStackBadge from "../components/ui/TechStackBadge";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

const ProfilePage = () => {
  const { profile, fetchProfile, updateTechStack, updateProjects, isLoading } =
    useUserStore();
  const [editingStack, setEditingStack] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <div className="mb-6">
            <p className="text-gray-300 text-lg">
              <strong className="text-white">Name:</strong>{" "}
              {profile.name || "Not set"}
            </p>
            <p className="text-gray-300 text-lg">
              <strong className="text-white">Email:</strong>{" "}
              {profile.email || "Not set"}
            </p>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Tech Stack</h2>
            <button
              onClick={() => setEditingStack(!editingStack)}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              {editingStack ? "Done Editing" : "Edit"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {profile.techStack.map((tech, index) => (
              <div key={index} className="flex items-center">
                <TechStackBadge
                  tech={tech}
                  onClick={
                    editingStack ? () => handleRemoveTech(tech) : undefined
                  }
                  className={
                    editingStack ? "cursor-pointer hover:bg-red-900/30" : ""
                  }
                />
              </div>
            ))}
          </div>

          {editingStack && (
            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTech()}
                placeholder="Add technology..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={handleAddTech}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Projects</h2>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Project</span>
            </button>
          </div>

          {showAddProject && (
            <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name..."
                className="w-full mb-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
              <textarea
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Project description..."
                rows="2"
                className="w-full mb-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
              <button
                onClick={handleAddProject}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Project
              </button>
            </div>
          )}

          <div className="space-y-4">
            {profile.projects.length > 0 ? (
              profile.projects.map((project, index) => (
                <div
                  key={index}
                  className="flex justify-between items-start p-4 border border-gray-800 rounded-lg bg-gray-900"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-gray-400 mt-1">{project.description}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveProject(index)}
                    className="ml-4 text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No projects added yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
