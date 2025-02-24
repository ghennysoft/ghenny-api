import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3"  // For connet with s3 Bucket
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"  // For generate signed url for one file on s3.
import crypto from "crypto"
import express from "express"
import multer from "multer";
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router()

const randomImageName = (bytes=32) => crypto.randomBytes(bytes).toString('hex')
const imageName = randomImageName();

const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
}) 

// Configure Multer for file uploads to S3
const upload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        // acl: 'public-read', // set as per your need
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname }); 
        },
        key: (req, file, cb) => {
            cb(null, 'new/'+imageName+file.originalname);
        },
    }),
});

// Route to handle file uploads
router.post('/upload1', upload.single('file'), (req, res) => {
    res.send({location: `${req.file.location}!`, file: req.file});
});
router.post('/upload', upload.array('files'), async (req, res) => {
    try {
        const uploadFiles = req.files;
        let links = [];
        uploadFiles.forEach(item=>{
            links.push(item.location)
        })
        res.status(200).json({Links: links, Files: req.files})
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'An error occured',})
    }
});

// Route to list all files in the S3 bucket
router.get('/list', async (req, res) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME, // replace with your bucket name
            Key: 'new/f8bb198a49f40e0bd9ba4c29404f1ae1967f83b1d213ac5cc04723476efbe192cachet.jpg',
        };
      
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, {expiresIn: 3600})
        res.json(url);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to download a specific file from S3
router.get('/download/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: filename });
        const response = await s3Client.send(command);
        
        // Set headers for file download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', response.ContentType);

        // Stream the file content to the response
        response.Body.pipe(res);
    } catch (error) {
        res.status(404).send('File Not Found');
    }
});

// Route to delete a specific file from S3
router.delete('/delete/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const command = new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: filename });
        await s3Client.send(command);
        res.send('File Deleted Successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});









// Route to list all files in the S3 bucket
router.get('/list', async (req, res) => {
    try {
        const command = new ListObjectsV2Command({ Bucket: BUCKET_NAME });
        const response = await s3Client.send(command);
        const keys = response.Contents.map(item => item.Key); 
        res.json(keys);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/addImg', upload.single("image"), async (req, res) => {
    const file = req.file;
    console.log(file);
    
    try {
        const imageName = randomImageName()
        console.log(imageName);
    
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: imageName,
            Body: buffer,
            ContentType: req.file.mimetype,
        }

        const command = new PutObjectCommand(params)
        await s3.send(command).then(data=>{
            console.log(data);
        }).catch(err=>{
            console.log(err);
        })

        return res.status(201).json("Image saved")

    } catch (error) {
        return res.status(500).json(error)
    }
})

router.get('/getPost', async (req, res) => {
    try {
        const posts = await PostModel.find()

        for(const post of posts){
            const getObjectParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: post.imageName,
            }
            const command = new GetObjectCommand(getObjectParams)
            const url = await getSignedUrl(s3, command, {expires: 3600})
            post.imageUrl = url
        }
        return res.status(200).json(req.file)
    } catch (error) {
        console.log(error)
    }
})

router.post('/deletePost', async (req, res) => {
    const post = await PostModel.findOne(req._id) 

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: post.imageName,
    }

    const command = new DeleteObjectCommand(params)
    await s3.send(command)

    try {
        await PostModel.findByIdAndDelete(post._id) 
        return res.status(201).json({})
    } catch (error) {
        console.log(error)
    }
})

export default router;