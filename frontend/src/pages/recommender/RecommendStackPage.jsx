import { useEffect, useMemo, useState } from "react";
import useRecommendationStore from "../../stores/recommendationStore";
import useUserStore from "../../stores/userStore";
import TechStackBadge from "../../components/ui/TechStackBadge";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const RecommendStackPage = () => {
  const {
    fetchJobTitles,
    fetchTitleTechStack,
    jobTitles,
    titleTechStack,
    isLoading,
    error,
    clearTitleTechStack,
  } = useRecommendationStore();
  const { profile } = useUserStore();

  const [titleSearch, setTitleSearch] = useState("");
  const [selectedTitle, setSelectedTitle] = useState("");

  useEffect(() => {
    fetchJobTitles();
  }, []);

  const filteredTitles = useMemo(() => {
    if (!titleSearch.trim()) return jobTitles;
    const q = titleSearch.toLowerCase();
    return jobTitles.filter((t) => String(t).toLowerCase().includes(q));
  }, [jobTitles, titleSearch]);

  const handleSelectTitle = async (title) => {
    setSelectedTitle(title);
    clearTitleTechStack();
    console.log("[RecommendStack] selected title:", title);
    console.log(
      "[RecommendStack] current profile.techStack:",
      profile?.techStack
    );
    const result = await fetchTitleTechStack(title);
    if (!result.success) {
      console.error("[RecommendStack] title techstack error:", result.error);
      return;
    }
    console.log(
      "[RecommendStack] backend tech_stack:",
      result.data?.tech_stack
    );
  };

  const currentTech = Array.isArray(profile?.techStack)
    ? profile.techStack
    : [];
  const recommended = Array.isArray(titleTechStack?.tech_stack)
    ? titleTechStack.tech_stack
    : [];

  const alreadyHave = useMemo(
    () =>
      recommended.filter((t) =>
        currentTech
          .map((x) => String(x).toLowerCase())
          .includes(String(t).toLowerCase())
      ),
    [recommended, currentTech]
  );
  const toLearn = useMemo(
    () =>
      recommended.filter(
        (t) =>
          !currentTech
            .map((x) => String(x).toLowerCase())
            .includes(String(t).toLowerCase())
      ),
    [recommended, currentTech]
  );

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Choose a Job Title to See Your Recommended Tech Stack
          </h1>
          <p className="text-gray-400 mb-8">
            We use your current skills (parsed from your Profile resume) to
            highlight what you already have and what to learn for the selected
            role.
          </p>

          {error && (
            <div className="mb-8 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Titles Search & List */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Job Titles
            </label>
            <input
              type="text"
              value={titleSearch}
              onChange={(e) => setTitleSearch(e.target.value)}
              placeholder="e.g., Full Stack Developer"
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold text-white">Job Titles</h2>
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <LoadingSpinner size="sm" /> Loading...
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredTitles.map((t, idx) => (
                <button
                  key={`${t}-${idx}`}
                  type="button"
                  onClick={() => handleSelectTitle(t)}
                  className={`px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                    selectedTitle === t
                      ? "bg-cyan-600 text-white border-cyan-500"
                      : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-cyan-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Result Sections */}
          {selectedTitle && (
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-white mb-2">
                {selectedTitle} – Recommended Tech Stack
              </h3>
              {!titleTechStack && isLoading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <LoadingSpinner size="sm" /> Fetching tech stack...
                </div>
              )}

              {titleTechStack && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      You Already Have
                    </h4>
                    {alreadyHave.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {alreadyHave.map((tech, idx) => (
                          <TechStackBadge key={`have-${idx}`} tech={tech} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No direct matches found in your current skills.
                      </p>
                    )}
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Recommended To Learn
                    </h4>
                    {toLearn.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {toLearn.map((tech, idx) => (
                          <TechStackBadge key={`learn-${idx}`} tech={tech} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        You're already aligned with the suggested stack for this
                        role.
                      </p>
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
