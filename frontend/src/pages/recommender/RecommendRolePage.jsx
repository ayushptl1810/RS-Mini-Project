import { useState } from "react";
import useRecommendationStore from "../../stores/recommendationStore";
import useUserStore from "../../stores/userStore";
import FileUploader from "../../components/common/FileUploader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { readFileAsBase64 } from "../../services/localUploadService";

const RecommendRolePage = () => {
  const {
    getRoleRecommendations,
    getJobRecommendations,
    jobRecommendations,
    isLoading,
    error,
  } = useRecommendationStore();
  const { updateResume } = useUserStore();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleFileSelect = async (file) => {
    setUploadedFile(file);
    setUploadingResume(true);

    try {
      // Save resume to profile (base64) for persistence
      const fileData = await readFileAsBase64(file);
      await updateResume({
        filename: fileData.filename,
        size: fileData.size,
        type: fileData.type,
        base64: fileData.base64,
      });

      // Parse resume to extracted skills
      const parsed = await getRoleRecommendations(file);
      if (!parsed.success) {
        console.error("[RecommendRole] parse error:", parsed.error);
        return;
      }
      const skills = parsed.data?.extracted_skills || [];
      console.log("[RecommendRole] extracted_skills:", skills);

      // Call job recommender with parsed skills
      const jobs = await getJobRecommendations(skills);
      if (!jobs.success) {
        console.error("[RecommendRole] job recommender error:", jobs.error);
      }
    } catch (uploadError) {
      console.error("[RecommendRole] save resume error:", uploadError);
      alert(`Failed to save resume: ${uploadError.message}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleClearResults = () => {
    setUploadedFile(null);
    useRecommendationStore.getState().clearAll();
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Get Job Recommendations From Resume
          </h1>
          <p className="text-gray-400 mb-8">
            Upload your resume; we will extract skills and fetch matching jobs
          </p>

          {!uploadedFile && !jobRecommendations && (
            <FileUploader
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx"
              maxSizeMB={10}
            />
          )}

          {uploadedFile && (isLoading || uploadingResume) && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-400">
                {uploadingResume
                  ? "Saving your resume..."
                  : "Analyzing resume and fetching jobs..."}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {jobRecommendations && !isLoading && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Job Matches
                </h2>
                <button
                  onClick={handleClearResults}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Upload Another Resume
                </button>
              </div>

              <div className="space-y-4">
                {jobRecommendations.matches?.map((m, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-cyan-500 bg-cyan-500/10 p-6 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {m.title}
                      </h3>
                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                        {Math.round((m.score || 0) * 100)}% Match
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">ID: {m.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendRolePage;
