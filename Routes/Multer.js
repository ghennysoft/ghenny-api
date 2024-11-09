import express from "express"
import multer from "multer"

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        return cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}_${file.originalname}`);
    },
});
const upload = multer({storage: storage})

router.post('/upload', upload.single("file"), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    
    // try {
    //     return res.status(200).json(req.body)
    // } catch (error) {
    //     console.log(error)
    // }
})

export default router;