import express from 'express'
import { addInPinCategory, completeProfile, createPinCategory, deleteUser, followUnfollowUser, getBirthdayWishes, getFollowings, getPinCategory, getProfile, getUserData, getUsersToPin, postBirthdayWish, searchData, suggestStudyAt, updatePicture, updateProfile } from '../Controllers/ProfileController.js'
import verifyToken from '../verifyToken.js'

const router = express.Router()

router.get('/search', searchData)
router.put('/followUnfollow', followUnfollowUser)
router.get('/suggest', suggestStudyAt)
router.post('/wish', postBirthdayWish)
router.post('/pinCategory', createPinCategory)
router.put('/addPinCategory', addInPinCategory)
router.get('/pinCategory/:id', getPinCategory)
router.get('/topin/:id', getUsersToPin)
router.get('/:id', getProfile)
router.get('/:id/followings', getFollowings)
router.put('/:id', updateProfile)
router.put('/picture/:id', updatePicture)
router.delete('/:id', verifyToken, deleteUser)
router.get('/data/:id', getUserData)
router.get('/wishes/:userId/:year', getBirthdayWishes)
router.put('/complete/:profileId/:userId', completeProfile)

export default router
