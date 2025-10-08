import express from 'express'
import { gschoolConnection, addInPinCategory, completeProfile, createPinCategory, deleteUser, getBirthdayWishes, getPinCategory, getFollowData, getProfile, getProfileById, getUserData, getUsersToFollow, followUnfollowUser, postBirthdayWish, searchData, suggestStudyAt, updateCoverPicture, updatePicture, updateProfile } from '../Controllers/ProfileController.js'
import authUser from '../utils/authMiddleware.js'
import { uploadProfile } from '../utils/upload.js'

const router = express.Router()

router.get('/school/role', authUser, gschoolConnection)
router.get('/search', authUser, searchData)
router.put('/followUnfollow', authUser, followUnfollowUser)
router.get('/suggest', authUser, suggestStudyAt)
router.post('/wish', authUser, postBirthdayWish)
router.post('/pinCategory', authUser, createPinCategory)
router.put('/addPinCategory', authUser, addInPinCategory)
router.get('/pinCategory/:id', authUser, getPinCategory)
router.get('/toFollow/:id', authUser, getUsersToFollow)
router.get('/:id', authUser, getProfile)
router.get('/find/:id', authUser, getProfileById)
router.get('/:id/follow', authUser, getFollowData)
router.put('/:id', authUser, updateProfile)
router.put('/picture/:id', authUser, uploadProfile.single('media'), updatePicture)
router.put('/cover/:id', authUser, uploadProfile.single('media'), updateCoverPicture)
router.delete('/:id', authUser, deleteUser)
router.get('/data/:id', authUser, getUserData)
router.get('/wishes/:userId/:year', authUser, getBirthdayWishes)
router.put('/complete/:profileId/:userId', authUser, completeProfile)

export default router
