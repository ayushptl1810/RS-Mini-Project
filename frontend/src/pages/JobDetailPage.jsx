import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useJobStore from "../stores/jobStore";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TechStackBadge from "../components/ui/TechStackBadge";
import {
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const JobDetailPage = () => {
  const { id } = useParams();
  const { fetchJobDetails, isLoading } = useJobStore();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const loadJob = async () => {
      const result = await fetchJobDetails(id);
      if (result.success) {
        setJob(result.data);
      }
    };

    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Job not found</p>
          <Link
            to="/jobs"
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/jobs"
          className="text-cyan-400 hover:text-cyan-300 mb-6 inline-flex items-center transition-colors"
        >
          ← Back to jobs
        </Link>

        <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                {job.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center space-x-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span className="text-lg font-medium">{job.company}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              {job.experienceLevel && (
                <span className="bg-cyan-500/20 text-cyan-400 text-sm font-semibold px-3 py-1 rounded-full border border-cyan-500/30">
                  {job.experienceLevel}
                </span>
              )}
              {job.isRemote && (
                <span className="bg-green-500/20 text-green-400 text-sm font-semibold px-3 py-1 rounded-full border border-green-500/30">
                  Remote
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {job.location && (
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-white">{job.location}</p>
                </div>
              </div>
            )}
            {job.postedDate && (
              <div className="flex items-start space-x-3">
                <CalendarIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="text-white">{job.postedDate}</p>
                </div>
              </div>
            )}
            {job.salary && (
              <div className="flex items-start space-x-3">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="text-white">{job.salary}</p>
                </div>
              </div>
            )}
          </div>

          {job.techStack && job.techStack.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.techStack.map((tech, index) => (
                  <TechStackBadge key={index} tech={tech} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">
              Description
            </h3>
            <p className="text-gray-300 whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Requirements
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">
                Benefits
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-6 border-t border-gray-900">
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
