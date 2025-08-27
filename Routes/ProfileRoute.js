import express from 'express'
import { gschoolConnection, addInPinCategory, completeProfile, createPinCategory, deleteUser, getBirthdayWishes, getPinCategory, getPins, getProfile, getProfileById, getUserData, getUsersToPin, PinningUser, postBirthdayWish, searchData, suggestStudyAt, updateCoverPicture, updatePicture, updateProfile } from '../Controllers/ProfileController.js'
import { uploadProfileS3 } from '../utils/aws.js'
import authUser from '../utils/authMiddleware.js'

const router = express.Router()

router.get('/school/role', authUser, gschoolConnection)
router.get('/search', authUser, searchData)
router.put('/followUnfollow', authUser, PinningUser)
router.get('/suggest', authUser, suggestStudyAt)
router.post('/wish', authUser, postBirthdayWish)
router.post('/pinCategory', authUser, createPinCategory)
router.put('/addPinCategory', authUser, addInPinCategory)
router.get('/pinCategory/:id', authUser, getPinCategory)
router.get('/topin/:id', authUser, getUsersToPin)
router.get('/:id', authUser, getProfile)
router.get('/find/:id', authUser, getProfileById)
router.get('/:id/followings', authUser, getPins)
router.put('/:id', authUser, updateProfile)
router.put('/picture/:id', authUser, uploadProfileS3.single('profilePicture'), updatePicture)
router.put('/cover/:id', authUser, uploadProfileS3.single('coverPicture'), updateCoverPicture)
router.delete('/:id', authUser, deleteUser)
router.get('/data/:id', authUser, getUserData)
router.get('/wishes/:userId/:year', authUser, getBirthdayWishes)
router.put('/complete/:profileId/:userId', authUser, uploadProfileS3.single('profilePicture'), completeProfile)

export default router
