import express from 'express'
import { addInPinCategory, completeProfile, createPinCategory, deleteUser, getBirthdayWishes, getPinCategory, getPins, getProfile, getUserData, getUsersToPin, PinningUser, postBirthdayWish, searchData, suggestStudyAt, updateCoverPicture, updatePicture, updateProfile } from '../Controllers/ProfileController.js'

const router = express.Router()

router.get('/search', searchData)
router.put('/followUnfollow', PinningUser)
router.get('/suggest', suggestStudyAt)
router.post('/wish', postBirthdayWish)
router.post('/pinCategory', createPinCategory)
router.put('/addPinCategory', addInPinCategory)
router.get('/pinCategory/:id', getPinCategory)
router.get('/topin/:id', getUsersToPin)
router.get('/:id', getProfile)
router.get('/:id/followings', getPins)
router.put('/:id', updateProfile)
router.put('/picture/:id', updatePicture)
router.put('/cover/:id', updateCoverPicture)
router.delete('/:id', deleteUser)
router.get('/data/:id', getUserData)
router.get('/wishes/:userId/:year', getBirthdayWishes)
router.put('/complete/:profileId/:userId', completeProfile)

export default router
