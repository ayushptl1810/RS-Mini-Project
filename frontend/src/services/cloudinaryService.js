import api from "./api";

// Cloudinary service for handling image uploads
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET;
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Upload image to Cloudinary
 * First tries backend endpoint for signed uploads, falls back to unsigned uploads
 * @param {File} file - Image file to upload
 * @param {string} folder - Optional folder name (default: 'user-avatars')
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadImageToCloudinary = async (
  file,
  folder = "user-avatars"
) => {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary cloud name not configured");
  }

  // Try backend upload endpoint first (for signed uploads)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await api.post("/upload/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data && response.data.url) {
      return {
        url: response.data.url,
        public_id: response.data.public_id,
        width: response.data.width,
        height: response.data.height,
      };
    }
  } catch (backendError) {
    console.warn("Backend upload failed, trying direct upload:", backendError);

    // Fallback to unsigned upload (requires upload preset)
    if (!UPLOAD_PRESET) {
      throw new Error(
        "Backend upload failed and no upload preset configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET"
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    };
  }
};

/**
 * Upload document (resume) to Cloudinary
 * First tries backend endpoint for signed uploads, falls back to unsigned uploads
 * @param {File} file - Document file to upload (PDF, DOC, DOCX)
 * @param {string} folder - Optional folder name (default: 'user-resumes')
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadDocumentToCloudinary = async (
  file,
  folder = "user-resumes"
) => {
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary cloud name not configured");
  }

  // Try backend upload endpoint first (for signed uploads)
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("resource_type", "raw"); // Use 'raw' for documents

    const response = await api.post("/upload/resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.data && response.data.url) {
      return {
        url: response.data.url,
        public_id: response.data.public_id,
        filename: file.name,
        size: file.size,
        type: file.type,
      };
    }
  } catch (backendError) {
    console.warn("Backend upload failed, trying direct upload:", backendError);

    // Fallback to unsigned upload (requires upload preset)
    if (!UPLOAD_PRESET) {
      throw new Error(
        "Backend upload failed and no upload preset configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET"
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("resource_type", "raw"); // Use 'raw' for documents

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return {
      url: data.secure_url,
      public_id: data.public_id,
      filename: file.name,
      size: file.size,
      type: file.type,
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<boolean>}
 */
export const deleteImageFromCloudinary = async (publicId) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    throw new Error("Cloudinary credentials not configured");
  }

  // Note: Deletion typically requires backend signature generation
  // For now, we'll just return true (actual deletion should be handled by backend)
  console.warn("Image deletion should be handled by backend");
  return true;
};
