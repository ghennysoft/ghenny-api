import express from 'express'
import { addQuestion, addSubject, addUserSubject, getQuestions, getSingleQuestion, getSubjectQuestions, getSubjects, getUserQuestions, reportQuestion, saveQuestion, searchQuestion, voteQuestion } from '../Controllers/QuestionController.js'
import authUser from '../utils/authMiddleware.js'
import ProfileModel from '../Models/profileModel.js'
import QuestionModel from '../Models/questionModel.js'
import AnswerModel from '../Models/answerModel.js'

const router = express.Router()

router.put('/user/subject/add', authUser, addUserSubject)
router.post('/subject/add', authUser, addSubject)
router.get('/subject/all', authUser, getSubjects)

router.post('/add', authUser, addQuestion)
router.get('/search', authUser, searchQuestion)
router.post('/:questionId/vote', authUser, voteQuestion)
router.post('/:questionId/report', authUser, reportQuestion)
router.post('/:questionId/save', authUser, saveQuestion)
router.get('/all/:userId', authUser, getQuestions)
router.get('/user/:userId', authUser, getUserQuestions)
router.get('/subject/:id', authUser, getSubjectQuestions)
router.get('/:id/:userId', authUser, getSingleQuestion)

// routes/gamification.js
router.get('/point/leaderboard', authUser, async (req, res) => {
  try {
    const { type, filter, timeRange = 'monthly' } = req.query;
    
    let matchStage = {};
    if (filter === 'university') {
      matchStage.university = req.query.university;
    } else if (filter === 'school') {
      matchStage.school = req.query.school;
    }

    const leaderboard = await ProfileModel.aggregate([
      { $match: matchStage },
      { $sort: { reputation: -1 } },
      { $limit: 50 },
      {
        $project: {
          username: 1,
          reputation: 1,
          level: 1,
          university: 1,
          school: 1,
          badgesCount: { $size: "$badges" }
        }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/point/stats/:userId', authUser, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const stats = await Promise.all([
      QuestionModel.countDocuments({ author: userId }),
      AnswerModel.countDocuments({ author: userId }),
      AnswerModel.countDocuments({ author: userId, acceptedAnswer: { $exists: true } }),
      ProfileModel.findById(userId).select('reputation level badges')
    ]);

    res.json({
      questionsCount: stats[0],
      answersCount: stats[1],
      acceptedAnswersCount: stats[2],
      reputation: stats[3].reputation,
      level: stats[3].level,
      badges: stats[3].badges.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router