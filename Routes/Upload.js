import express from 'express'
import cloudinary from '../cloudinary.js'

const router = express.Router()

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
            res.json({msg: 'Image deleted'})
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