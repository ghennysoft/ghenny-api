import express from 'express';
import {
  getConversations,
  createConversation,
  updateConversation,
  deleteConversation
} from '../Controllers/conversationController.js';
import authUser from '../utils/authMiddleware.js'

const router = express.Router();

router.get('/', authUser, getConversations);
router.post('/', authUser, createConversation);
router.put('/:conversationId', authUser, updateConversation);
router.delete('/:conversationId', authUser, deleteConversation);

export default router;