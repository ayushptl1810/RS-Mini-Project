import { useState } from "react";
import useRecommendationStore from "../../stores/recommendationStore";
import useUserStore from "../../stores/userStore";
import FileUploader from "../../components/common/FileUploader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { uploadDocumentToCloudinary } from "../../services/cloudinaryService";

const RecommendRolePage = () => {
  const { getRoleRecommendations, roleRecommendations, isLoading, error } =
    useRecommendationStore();
  const { updateResume } = useUserStore();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const handleFileSelect = async (file) => {
    setUploadedFile(file);
    setUploadingResume(true);

    try {
      // Upload resume to Cloudinary first
      const uploadResult = await uploadDocumentToCloudinary(file);

      // Save resume URL to user profile
      await updateResume({
        url: uploadResult.url,
        filename: uploadResult.filename,
        size: uploadResult.size,
        type: uploadResult.type,
        public_id: uploadResult.public_id,
      });

      // Get recommendations (backend can use Cloudinary URL if needed)
      const result = await getRoleRecommendations({
        file,
        cloudinaryUrl: uploadResult.url,
        filename: uploadResult.filename,
      });

      if (!result.success) {
        console.error("Error getting recommendations:", result.error);
      }
    } catch (uploadError) {
      console.error("Error uploading resume:", uploadError);
      alert(`Failed to upload resume: ${uploadError.message}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleClearResults = () => {
    setUploadedFile(null);
    useRecommendationStore.getState().clearRoleRecommendations();
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Get Job Role Recommendations
          </h1>
          <p className="text-gray-400 mb-8">
            Upload your resume and let our AI analyze your experience to suggest
            the best job roles for you
          </p>

          {!uploadedFile && !roleRecommendations && (
            <FileUploader
              onFileSelect={handleFileSelect}
              accept=".pdf,.doc,.docx"
              maxSizeMB={5}
            />
          )}

          {uploadedFile && (isLoading || uploadingResume) && (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-400">
                {uploadingResume
                  ? "Uploading your resume..."
                  : "Analyzing your resume..."}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {roleRecommendations && !isLoading && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Recommended Roles
                </h2>
                <button
                  onClick={handleClearResults}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Upload Another Resume
                </button>
              </div>

              <div className="space-y-4">
                {roleRecommendations.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-cyan-500 bg-cyan-500/10 p-6 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {rec.role}
                      </h3>
                      <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-semibold">
                        {Math.round(rec.confidence * 100)}% Match
                      </span>
                    </div>
                    <p className="text-gray-300">{rec.description}</p>
                  </div>
                ))}
              </div>

              {roleRecommendations.uploadedResume && (
                <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                  <p className="text-sm text-gray-400">
                    <strong className="text-white">Uploaded:</strong>{" "}
                    {roleRecommendations.uploadedResume.filename}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecommendRolePage;
