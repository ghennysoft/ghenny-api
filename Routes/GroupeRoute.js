// routes/groups.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const groupController = require('../controllers/groupController');

// Routes Groupes
router.post('/', auth, groupController.createGroup);
router.get('/:groupId', auth, groupController.getGroup);
router.put('/:groupId', auth, groupController.updateGroup);
router.post('/:groupId/join', auth, groupController.joinGroup);
router.post('/:groupId/leave', auth, groupController.leaveGroup);
router.post('/:groupId/posts', auth, groupController.createGroupPost);
router.get('/:groupId/posts', auth, groupController.getGroupPosts);
router.get('/:groupId/members', auth, groupController.getGroupMembers);

module.exports = router;