import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from 'multer-s3';
import crypto from "crypto";
import path from "path";
import dotenv from 'dotenv';

dotenv.config(); 

// Configuration Digital Ocean Spaces avec AWS SDK v3
export const s3Client = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT, // ex: "https://nyc3.digitaloceanspaces.com"
  region: process.env.SPACES_REGION || 'fra1',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|mp3|wav/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: File upload only supports the following filetypes - ' + filetypes);
  }
};

// Configure Multer for file uploads to S3
export const uploadPost = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.SPACES_BUCKET,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.originalname }); 
    },
    key: (req, file, cb) => {
      const imageName = crypto.randomBytes(32).toString('hex');
      const fileExtension = file.originalname.split('.').pop();
      const finalName = 'post/' + imageName + '.' + fileExtension;
      cb(null, finalName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: fileFilter,
  // limits: {
  //   fileSize: 50 * 1024 * 1024, // 50MB limit pour les vidéos
  // }
});

// Configure Multer for file uploads to S3
export const uploadProfile = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.SPACES_BUCKET,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.originalname }); 
    },
    key: (req, file, cb) => {
      const imageName = crypto.randomBytes(32).toString('hex');
      const fileExtension = file.originalname.split('.').pop();
      const finalName = 'profile/' + imageName + '.' + fileExtension;
      cb(null, finalName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: fileFilter,
  // limits: {
  //   fileSize: 50 * 1024 * 1024, // 50MB limit pour les vidéos
  // }
});

// Configure Multer for file uploads to S3
export const uploadMessage = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.SPACES_BUCKET,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.originalname }); 
    },
    key: (req, file, cb) => {
      const imageName = crypto.randomBytes(32).toString('hex');
      const fileExtension = file.originalname.split('.').pop();
      const finalName = 'message/' + imageName + '.' + fileExtension;
      cb(null, finalName);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
  }),
  fileFilter: fileFilter,
  // limits: {
  //   fileSize: 50 * 1024 * 1024, // 50MB limit pour les vidéos
  // }
});


const videoUpload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.SPACES_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/quicktime') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
  },
});

// module.exports = { upload, videoUpload };
