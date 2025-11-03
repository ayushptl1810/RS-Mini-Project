import { Link } from "react-router-dom";
import {
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import TechStackBadge from "../ui/TechStackBadge";

const JobCard = ({ job }) => {
  return (
    <div className="bg-gray-950 border border-gray-900 rounded-xl shadow-lg p-6 hover:border-cyan-500/50 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link
            to={`/jobs/${job.id}`}
            className="text-xl font-semibold text-white hover:text-cyan-400 transition-colors"
          >
            {job.title}
          </Link>
          <p className="text-gray-400 mt-1">{job.company}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {job.experienceLevel && (
            <span className="bg-cyan-500/20 text-cyan-400 text-xs font-semibold px-3 py-1 rounded-full border border-cyan-500/30">
              {job.experienceLevel}
            </span>
          )}
          {job.isRemote && (
            <span className="bg-green-500/20 text-green-400 text-xs font-semibold px-3 py-1 rounded-full border border-green-500/30">
              Remote
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-300 mb-4 line-clamp-2">{job.description}</p>

      {job.techStack && job.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.techStack.map((tech, index) => (
            <TechStackBadge key={index} tech={tech} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
        {job.location && (
          <div className="flex items-center space-x-1">
            <MapPinIcon className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        )}
        {job.postedDate && (
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-4 w-4" />
            <span>{job.postedDate}</span>
          </div>
        )}
        {job.salary && (
          <div className="flex items-center space-x-1">
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>{job.salary}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobCard;
