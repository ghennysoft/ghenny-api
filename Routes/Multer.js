import multer from 'multer'

// const router = express.Router();
// router.post('/', upload, (req, res) => {
//    const file = req.file.filename;
//    const newImage = {file-demo : file}
//    try{
//      await newImage.save();
//      res.status(201).json(newimage );
//    }catch(error){
//      res.status(409).json({ message: error.message });
//    }

// });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "--" + file.originalname);
    }
}); 