import { useState, useRef } from "react";
import { DocumentArrowUpIcon } from "@heroicons/react/24/outline";

const FileUploader = ({
  onFileSelect,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 5,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError("");

    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!acceptedTypes.includes(fileExtension)) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${
          dragActive
            ? "border-cyan-500 bg-cyan-500/10"
            : "border-gray-700 hover:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <DocumentArrowUpIcon className="w-16 h-16 text-gray-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-white">
              Drag and drop your resume here
            </p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <p className="text-xs text-gray-500 mt-2">
              Supported: PDF, DOC, DOCX (Max {maxSizeMB}MB)
            </p>
          </div>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default FileUploader;
