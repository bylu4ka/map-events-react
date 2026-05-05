import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const uploadImage = async (file) => {
  const result = await cloudinary.v2.uploader.upload(file, {
    folder: "events",
  });

  return result.secure_url;
};
