const cloudinary = require("../config/cloudinaryConfig.js");

// handler cho avatar upload
const uploadAvatarService = (req, res) => {
  return new Promise((resolve, reject) => {
    if (!req.file) {
      return reject(new Error('No file provided'));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'avatar', public_id: `avatar-${Date.now()}` },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    // Sử dụng buffer của file để upload lên Cloudinary
    stream.end(req.file.buffer);
  });
};

// handler cho image upload
const uploadImageService = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadImage.single('image')(req, res, function (err) {
      if (err) {
        reject({ message: 'Image upload failed', error: err });
      } else {
        resolve(req.file.path);
      }
    });
  });
};
const uploadBookImage = (req, res) => {
  return new Promise((resolve, reject) => {
    if (!req.file) {
      return reject(new Error('No file provided'));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'book', public_id: `book-${Date.now()}` },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    // Sử dụng buffer của file để upload lên Cloudinary
    stream.end(req.file.buffer);
  });
}
module.exports = {
  uploadAvatarService,
  uploadImageService,
  uploadBookImage
};
