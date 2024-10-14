import express from 'express'
import cloudinary from '../cloudinary.js'
import multer from "multer"

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, `img-${Date.now()}.${file.originalname}`);
    },
});

const isImage = (req, res, cb) => {
        if(res.mimetype.startsWith('image')){
            cb(null, true);
        } else {
            cb(new Error('Only images is allowed'));
        };
    };
const upload = multer({
    storage: storage,
    fileFilter: isImage,
})

// Upload image
router.post('/upload', (res, req) => {
     try {
        if(!req.files || Object.keys(req.files).length===0)
            return res.status(400).json({msg: 'No file uploaded.'})

        const file = req.files.file;
        if(file.size > 1024*1024) {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: 'Size too large'})
        } 
        
        if(file.mimeType !== 'image/jpg' && file.mimeType !== 'image/png') {
            removeTmp(file.tempFilePath)
            return res.status(400).json({msg: 'File format is incorrect'})
        }

        cloudinary.v2.uploader.upload(file.tempFilePath, {folder: "image"}, async(err, result)=> {
            if(err) throw err
            removeTmp(file.tempFilePath)
            res.json({public_id: result.public_id, url: result.secure_url})
        })

     } catch (error) {
        return res.status(500).json({msg: error.message})
     }
})

// Delete image
router.post('/destroy', (req, res) => {
    try {
        const {public_id} = req.body;
        if(!public_id) return res.status(400).json({msg: 'No images selected'})

        cloudinary.v2.uploader.destroy(public_id, async(err, result)=> {
            if(err) throw err
            res.status(201).json({msg: 'Image deleted'})
        })
    } catch (error) {
        return res.status(500)._construct({msg: error.message})
    }
})

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if(err) throw err;
    })
}

export default router           