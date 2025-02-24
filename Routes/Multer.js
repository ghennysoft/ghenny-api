import express from "express"
import multer from "multer"
import crypto from "crypto"

const router = express.Router()

const randomImageName = (bytes=32) => crypto.randomBytes(bytes).toString('hex')
const imageName = randomImageName()

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        return cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        if(file){
            return cb(null, `${Date.now()}_${file.originalname}`);
        } else {
            return;
        }
    },
});
const upload = multer({storage: storage})

router.post('/upload', upload.single("file"), (req, res) => {
    try {
        return res.status(200).json(req.file)
    } catch (error) {
        console.log(error)
    }
})

export default router;