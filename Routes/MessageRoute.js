import express from 'express';
import {
  sendMessage,
  getMessages,
  editMessage,
  deleteMessage,
  markAsRead
} from '../Controllers/messageController.js';
import { upload } from '../utils/s3.js';
import authUser from '../utils/authMiddleware.js'

const router = express.Router();

router.post('/', authUser, upload.array('attachments', 10), sendMessage);
router.get('/:conversationId', authUser, getMessages);
router.put('/:messageId', authUser, editMessage);
router.delete('/:messageId', authUser, deleteMessage);
router.post('/:messageId/read', authUser, markAsRead);

export default router;