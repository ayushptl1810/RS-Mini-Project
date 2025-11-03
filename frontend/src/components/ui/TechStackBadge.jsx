const TechStackBadge = ({ tech, priority, onClick, className = "" }) => {
  const priorityColors = {
    Critical:
      "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    Important:
      "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30",
    "Nice to have":
      "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
    Research:
      "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
    default:
      "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30",
  };

  const colorClass = priorityColors[priority] || priorityColors.default;

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${colorClass} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      title={priority ? `Priority: ${priority}` : ""}
    >
      {tech}
    </span>
  );
};

export default TechStackBadge;
