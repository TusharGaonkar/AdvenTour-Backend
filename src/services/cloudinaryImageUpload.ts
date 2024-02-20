import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// upload tour images to cloudinary returns a promise with cloudinary response
const uploadTourImageToCloudinary = async (filePathOnDisk: string) => {
  return new Promise((resolve, reject) => {
    const options = {
      use_filename: true,
      transformation: [
        { width: 1920, height: 1080, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],

      folder: `adventour-tour-images`,
    };

    cloudinary.uploader.upload(filePathOnDisk, options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.secure_url);
      }
    });
  });
};

export default uploadTourImageToCloudinary;
