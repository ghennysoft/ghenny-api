import {S3Client, GetObjectCommand} from "@aws-sdk/client-s3"  // For connet with s3 Bucket
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"  // For generate signed url for one file on s3.
import crypto from "crypto"
import multer from "multer";
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

dotenv.config();

const randomImageName = (bytes=32) => crypto.randomBytes(bytes).toString('hex')
const imageName = randomImageName();

export const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

// Generate signed URL
export const getS3URL = async (file) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME, // replace with your bucket name
      Key: file,
    }
    const command = new GetObjectCommand(params);
    const awsURL = await getSignedUrl(s3Client, command)
    return awsURL;
  }

// Configure Multer for file uploads to S3
export const uploadPostS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.originalname }); 
        },
        key: (req, file, cb) => {
            cb(null, 'post/'+imageName+file.originalname);
        },
    }),
});

// Configure Multer for file uploads to S3
export const uploadProfileS3 = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.originalname }); 
        },
        key: (req, file, cb) => {
            cb(null, 'profile/'+imageName+file.originalname);
        },
    }),
});
