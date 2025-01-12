// npm i @aws-sdk/client-s3
// npm i @aws-sdk/s3-request-presigner
// npm i dotenv

import {S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from "aws-sdk/client-s3"  // For connet with s3 Bucket
import {getSignedUrl} from "aws-sdk/s3-request-presigner"  // For generate signed url for one file on s3.
import crypto from "crypto"
import sharp from "sharp"  // For resize image

const randomImageName = (bytes=32) => crypto.randomBytes(bytes).toString('hex')

const s3 = new S3Client({
    Credentials: {
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
    region: process.env.BUCKET_REGION
})

const storage = multer.memoryStorage()
const upload = multer({storage: storage})

router.post('/getPost', async (req, res) => {
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

router.post('/addPost', upload.single("file"), async (req, res) => {
    const buffer = await sharp(req.file.Buffer).resize({heigth: 1920, width: 1080, fit: 'contain'}).toBuffer()

    const imageName = randomImageName()
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageName,
        Body: buffer,
        ContentType: req.file.mimetype,
    }

    const command = new PutObjectCommand(params)
    await s3.send(command)

    try {
        const post = new PostModel({
            name: imageName,
            caption: req.body.caption,
        })
        return res.status(201).json(post)
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