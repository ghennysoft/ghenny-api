import challengeModel from "../Models/challengeModel";
import ProfileModel from "../Models/profileModel";
import QuestionModel from "../Models/questionModel";

export default class ChallengeService {
  static async getActiveChallenges(userId = null) {
    const now = new Date();
    const challenges = await challengeModel.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).populate('reward.badge');

    if (userId) {
      // Calculer la progression pour l'utilisateur
      for (const challenge of challenges) {
        await this.calculateUserProgress(challenge, userId);
      }
    }

    return challenges;
  }

  static async calculateUserProgress(challenge, userId) {
    const userParticipation = challenge.participants.find(p => 
      p.userId.toString() === userId.toString()
    );

    if (!userParticipation) {
      challenge.participants.push({ userId, progress: 0 });
      await challenge.save();
      return 0;
    }

    // Calculer la progression en temps réel
    let progress = 0;
    const user = await ProfileModel.findById(userId);
    const startDate = challenge.startDate;

    switch (challenge.criteria.action) {
      case 'answer_count':
        progress = await QuestionModel.countDocuments({
          author: userId,
          type: 'answer',
          createdAt: { $gte: startDate }
        });
        break;
      case 'question_count':
        progress = await QuestionModel.countDocuments({
          author: userId, 
          type: 'question',
          createdAt: { $gte: startDate }
        });
        break;
    //   case 'reputation_gain':
    //     const pointHistory = await PointHistory.aggregate([
    //       {
    //         $match: {
    //           userId: new mongoose.Types.ObjectId(userId),
    //           timestamp: { $gte: startDate },
    //           points: { $gt: 0 }
    //         }
    //       },
    //       {
    //         $group: {
    //           _id: null,
    //           total: { $sum: '$points' }
    //         }
    //       }
    //     ]);
    //     progress = pointHistory[0]?.total || 0;
    //     break;
    }

    // Mettre à jour la progression
    userParticipation.progress = Math.min(progress, challenge.criteria.target);
    userParticipation.completed = progress >= challenge.criteria.target;
    
    if (userParticipation.completed && !userParticipation.completedAt) {
      userParticipation.completedAt = new Date();
      await this.awardChallengeReward(userId, challenge);
    }

    await challenge.save();
    return progress;
  }

  static async awardChallengeReward(userId, challenge) {
    const user = await ProfileModel.findById(userId);
    
    if (challenge.reward.points > 0) {
      user.reputation += challenge.reward.points;
      user.experience += challenge.reward.points;
      user.updateLevel();
      
    //   await PointHistory.create({
    //     userId,
    //     action: 'challenge_reward',
    //     points: challenge.reward.points,
    //     newReputation: user.reputation
    //   });
    }

    if (challenge.reward.badge) {
      user.badges.push({ badgeId: challenge.reward.badge._id });
    }

    await user.save();

    // Notification
    // await NotificationService.sendToastNotification(userId, {
    //   type: 'success',
    //   message: `🎉 Défi accompli! +${challenge.reward.points} points!`
    // });
  }
}