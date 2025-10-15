import ProfileModel from "../Models/profileModel.js";
import PointHistoryModel from "../Models/pointHistoryModel.js";

export default class GamificationService {
  static async awardPoints(userId, action, target, targetType) {
    const pointsConfig = {
      'ask_question': 2,
      'receive_answer': 1,
      'answer_question': 5,
      'answer_accepted': 15,
      'receive_upvote': 3,
      'receive_downvote': -3,
      'give_upvoted': 2,
      'give_downvoted': -1,
    };

    const points = pointsConfig[action];
    const user = await ProfileModel.findById(userId);
    
    if (user) {
      user.reputation += points;
      user.experience += Math.max(points, 0); // L'expérience ne baisse pas
      // user.updateLevel();
      await user.save();

      // Créer un historique des points
      await PointHistoryModel.create({
        userId,
        action,
        points,
        target,
        targetType,
        newReputation: user.reputation
      });

      // Vérifier les badges
      // await this.checkBadges(userId);
      
      return points;
    }
  }

  // static async checkBadges(userId) {
  //   const user = await ProfileModel.findById(userId).populate('badges.badgeId');
  //   const stats = await this.getUserStats(userId);
    
  //   const availableBadges = await Badge.find();
    
  //   for (const badge of availableBadges) {
  //     if (!user.badges.some(b => b.badgeId._id.equals(badge._id))) {
  //       const earned = await this.evaluateBadge(badge, stats, user);
  //       if (earned) {
  //         user.badges.push({ badgeId: badge._id });
  //         // Notification pour nouveau badge
  //       //   await NotificationService.notifyNewBadge(userId, badge);
  //       }
  //     }
  //   }
  //   await user.save();
  // }
}