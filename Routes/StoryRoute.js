import express from 'express';
import multer from 'multer';
// import fs from 'fs-extra';
import path from 'path';
import Story from '../Models/storyModel.js';
import authUser from '../utils/authMiddleware.js'

const router = express.Router();

// Configuration des dossiers d'upload
const uploadPath = path.join(process.cwd(), 'uploads');
const uploadPathChunks = path.join(process.cwd(), 'chunks');

// Assurer que les dossiers existent
// fs.mkdirSync(uploadPath, { recursive: true });
// fs.mkdirSync(uploadPathChunks, { recursive: true });

// Configuration de Multer pour l'upload chunké :cite[1]
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPathChunks);
  },
  filename: (req, file, cb) => {
    const baseFileName = file.originalname.replace(/\s+/g, '');
    
    // fs.readdir(uploadPathChunks, (err, files) => {
    //   if (err) return cb(err);
      
    //   const matchingFiles = files.filter(f => f.startsWith(baseFileName));
    //   let chunkNumber = 0;
      
    //   if (matchingFiles.length > 0) {
    //     const highestChunk = Math.max(...matchingFiles.map(f => {
    //       const match = f.match(/\.part_(\d+)$/);
    //       return match ? parseInt(match[1], 10) : -1;
    //     }));
    //     chunkNumber = highestChunk + 1;
    //   }
      
    //   const fileName = `${baseFileName}.part_${chunkNumber}`;
    //   cb(null, fileName);
    // });
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Not a video file. Please upload only videos.'));
    }
  }
});

// Route pour l'upload de chunks vidéo :cite[1]
router.post('/upload', authUser, upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded.' });
  }

  try {
    const chunkNumber = Number(req.body.chunk);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = req.body.originalname.replace(/\s+/g, '');

    if (chunkNumber === totalChunks - 1) {
      await mergeChunks(fileName, totalChunks);
    }

    const fileInfo = {
      filename: fileName,
      originalName: req.body.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      videoUrl: `/uploads/${fileName}`
    };

    res.status(200).json({
      message: 'Chunk uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error during file upload:', error);
    res.status(500).json({ error: 'An error occurred while uploading the video.' });
  }
});

// Fonction pour merger les chunks :cite[1]
const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function mergeChunks(fileName, totalChunks) {
  const writeStream = fs.createWriteStream(path.join(uploadPath, fileName));

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const chunkStream = fs.createReadStream(chunkPath);
        await new Promise((resolve, reject) => {
          chunkStream.pipe(writeStream, { end: false });
          chunkStream.on('end', resolve);
          chunkStream.on('error', reject);
        });
        await fs.promises.unlink(chunkPath);
        break;
      } catch (error) {
        if (error.code === 'EBUSY') {
          await delay(RETRY_DELAY);
          retries++;
        } else {
          throw error;
        }
      }
    }

    if (retries === MAX_RETRIES) {
      writeStream.end();
      throw new Error(`Failed to merge chunk ${i} after ${MAX_RETRIES} retries`);
    }
  }

  writeStream.end();
}

// Route pour créer une story
router.post('/', authUser, async (req, res) => {
  try {
    const { author, mediaType, textContent, backgroundColor, mediaUrl } = req.body;

    const story = new Story({
      author,
      mediaType,
      textContent,
      backgroundColor,
      mediaUrl
    });

    await story.save();
    console.log({DATA: story});
    res.status(201).json(story);
  } catch (error) {
    console.log({ERROR: error});
    res.status(500).json({ error: error.message });
}
});

router.get('/grouped', authUser, async (req, res) => {
  try {
    const stories = await Story.find()
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    // Grouper les stories par auteur
    const groupedStories = stories.reduce((acc, story) => {
      const authorId = story.author._id.toString();
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: [],
          totalStories: 0,
          viewedStories: 0
        };
      }
      acc[authorId].stories.push(story);
      acc[authorId].totalStories++;
      return acc;
    }, {});

    res.json(Object.values(groupedStories));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour récupérer les stories
router.get('/', authUser, async (req, res) => {
    try {
        const stories = await Story.find()
        .populate('author', 'profilePicture')
        .sort({ createdAt: -1 });
        console.log({DATA: stories});
        res.status(200).json(stories);
    } catch (error) {
      console.log({ERROR: error});
    res.status(500).json({ error: error.message });
  }
});

// Route pour marquer une story comme vue
router.post('/:id/view', authUser, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    if (!story.views.includes(req.body.userId)) {
      story.views.push(req.body.userId);
      await story.save();
    }

    res.json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router