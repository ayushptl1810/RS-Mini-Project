const TechStackBadge = ({ tech, priority, onClick, className = "" }) => {
  const priorityColors = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/30",
    Important: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    "Nice to have": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Research: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    default: "bg-gray-800 text-gray-300 border-gray-700",
  };

  const colorClass = priorityColors[priority] || priorityColors.default;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorClass} ${
        onClick ? "cursor-pointer hover:opacity-80" : ""
      } ${className}`}
      onClick={onClick}
      title={priority ? `Priority: ${priority}` : ""}
    >
      {tech}
    </span>
  );
};

export default TechStackBadge;
