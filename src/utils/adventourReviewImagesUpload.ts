import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import express from 'express';
import fs from 'fs';

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const uniqueFileName = crypto.randomBytes(8).toString('hex');
    const fileExtension = path.extname(file.originalname);
    cb(null, uniqueFileName + fileExtension);
  },

  destination: (req, file, cb) => {
    const reviewImagesUploadDir = path.join(
      __dirname,
      '..',
      '..',
      'public',
      'review-images-upload'
    );

    try {
      if (!fs.existsSync(reviewImagesUploadDir)) {
        fs.mkdirSync(reviewImagesUploadDir, { recursive: true });
      }
    } catch (err) {
      cb(err, reviewImagesUploadDir);
    }

    cb(null, reviewImagesUploadDir);
  },
});

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const { mimetype } = file;

  if (mimetype && mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadReviewImagesToServer = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

export default uploadReviewImagesToServer;
