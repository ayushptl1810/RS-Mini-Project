import { useState } from "react";
import useRecommendationStore from "../../stores/recommendationStore";
import TechStackBadge from "../../components/ui/TechStackBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const RecommendStackPage = () => {
  const { getStackRecommendations, stackRecommendations, isLoading, error } =
    useRecommendationStore();
  const [roleInput, setRoleInput] = useState("");

  const popularRoles = [
    "Full Stack Developer",
    "Backend Developer",
    "Frontend Developer",
    "DevOps Engineer",
    "Data Scientist",
    "Machine Learning Engineer",
    "Mobile Developer",
    "Cloud Engineer",
  ];

  const handleRoleSelect = async (role) => {
    setRoleInput(role);
    const result = await getStackRecommendations(role);
    if (!result.success) {
      console.error("Error getting recommendations:", result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleInput.trim()) return;

    const result = await getStackRecommendations(roleInput.trim());
    if (!result.success) {
      console.error("Error getting recommendations:", result.error);
    }
  };

  const handleClearResults = () => {
    setRoleInput("");
    useRecommendationStore.getState().clearStackRecommendations();
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Discover Your Tech Stack
          </h1>
          <p className="text-gray-400 mb-8">
            Enter the job role you're interested in and get a curated list of
            technologies you should learn to excel in that role
          </p>

          {!stackRecommendations && (
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Job Role
                  </label>
                  <input
                    type="text"
                    id="role"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g., Full Stack Developer"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    Or select a popular role:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularRoles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleSelect(role)}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-cyan-400 transition-colors"
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!roleInput.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Recommendations
                </button>
              </div>
            </form>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-400">
                Finding the perfect tech stack...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {stackRecommendations && !isLoading && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Tech Stack for {stackRecommendations.role}
                </h2>
                <button
                  onClick={handleClearResults}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                >
                  Try Another Role
                </button>
              </div>

              <div className="space-y-6">
                {stackRecommendations.stack.map((tech, index) => (
                  <div
                    key={index}
                    className="border border-gray-800 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <TechStackBadge
                        tech={tech.tech}
                        priority={tech.priority}
                      />
                    </div>
                    <p className="text-gray-300">{tech.description}</p>
                  </div>
                ))}
              </div>

              {stackRecommendations.learningResources && (
                <div className="mt-8 bg-gray-900 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Learning Resources
                  </h3>
                  <div className="space-y-2">
                    {stackRecommendations.learningResources.map(
                      (resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                        >
                          {resource.title}
                        </a>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendStackPage;
