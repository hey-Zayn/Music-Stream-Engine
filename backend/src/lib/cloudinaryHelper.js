const cloudinary = require("./cloudinary");

const getPublicId = (url) => {
  if (!url) return null;
  const parts = url.split("/");
  const fileName = parts.pop();
  const publicId = fileName.split(".")[0];
  return publicId;
};

const uploadToCloudinary = async (file, folder = "music-app") => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: "auto",
      folder: folder,
    });
    return result.secure_url;
  } catch (err) {
    console.log("Error in uploadToCloudinary:", err);
    throw new Error(err.message || "Cloudinary upload failed");
  }
};

module.exports = { getPublicId, uploadToCloudinary };
