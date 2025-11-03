import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useJobStore from "../stores/jobStore";
import useAuthStore from "../stores/authStore";
import JobCard from "../components/jobs/JobCard";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const JobListingsPage = () => {
  const { isAuthenticated } = useAuthStore();
  const {
    jobs,
    personalizedJobs,
    fetchJobs,
    updateFilters,
    getFilteredJobs,
    isLoading,
  } = useJobStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs(true);
      fetchJobs(false);
    } else {
      fetchJobs(false);
    }
  }, [isAuthenticated, fetchJobs]);

  useEffect(() => {
    updateFilters({
      search: searchQuery,
      location: locationQuery,
      remote: remoteOnly,
    });
  }, [searchQuery, locationQuery, remoteOnly, updateFilters]);

  const displayedJobs =
    isAuthenticated && personalizedJobs.length > 0 ? personalizedJobs : jobs;
  const filteredJobs = getFilteredJobs();
  const finalJobs = filteredJobs.length > 0 ? filteredJobs : displayedJobs;

  return (
    <div className="min-h-screen py-8 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            {isAuthenticated
              ? "Personalized Job Recommendations"
              : "Browse All Jobs"}
          </h1>
          <p className="text-gray-400">
            {isAuthenticated
              ? "Jobs matched to your profile and tech stack"
              : "Sign in to see personalized recommendations"}
          </p>
        </div>

        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Location"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="rounded border-gray-700 bg-gray-900 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-gray-300">Remote only</span>
            </label>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : finalJobs.length > 0 ? (
          <div className="grid gap-6">
            {finalJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No jobs found</p>
            <Link
              to="/"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Return to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingsPage;
