import AnswerModel from "../Models/answerModel.js";
import QuestionModel from "../Models/questionModel.js";
import GamificationService from "../utils/gamification.js";

export const addAnswer = async (req, res) => {
    const author = req.user._id
    try {
        if(!req.body.content) {
            res.status(400).json('Tapez votre reponse...')
        } else if(!req.body.questionId) {
            res.status(400).json('Question id empty...')
        } else {
            const newAnswer = new AnswerModel({
                content: req.body.content,
                questionId: req.body.questionId,
                author
            });
            await newAnswer.save();

            const find_question = await QuestionModel.findById(req.body.questionId)
            await find_question.updateOne({$push: {"answers": newAnswer._id}})
            find_question.save()

            // Add point
            await GamificationService.awardPoints(req.user._id, 'answer_question', newAnswer._id, 'answer');
            await GamificationService.awardPoints(find_question?.author?._id, 'receive_answer', find_question?._id, 'question');

            res.status(200).json({
                message: "Reponse ajouté avec success!", 
                answer: newAnswer,
                question: find_question,
            })
        }
    } catch (error) {
        console.log(error);        
        res.status(500).json(error)
    }
}

export const acceptAnswer = async (req, res) => {
    try {
        const { answerId } = req.body;
        const question = await QuestionModel.findById(req.params.questionId);
        const answer = await AnswerModel.findById(answerId);

        if (!question || !answer) {
        return res.status(404).json({ error: 'Question ou réponse non trouvée' });
        }

        // Vérifier que l'utilisateur est l'auteur de la question
        if (question.author.toString() !== req.user._id) {
        return res.status(403).json({ error: 'Non autorisé' });
        }

        // Empêcher d'accepter sa propre réponse
        if (answer.author.toString() === req.user._id) {
        return res.status(400).json({ error: 'Vous ne pouvez pas accepter votre propre réponse' });
        }

        // Réinitialiser l'ancienne réponse acceptée
        // await AnswerModel.updateMany(
        // { questionId: question._id, isAccepted: true },
        // { isAccepted: false }
        // );

        // Accepter la nouvelle réponse
        answer.isAccepted = true;
        await answer.save();

        question.acceptedAnswer = answerId;
        await question.save();

        // Points pour la réponse acceptée
        await GamificationService.awardPoints(
            answer.author._id, 
            'answer_accepted',
            answer._id, 
            'answer'
        );

        res.status(200).json({ message: 'Réponse acceptée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateComment = async (req, res) => {
    const commentId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const comment = await CommentModel.findById(commentId)
        if(comment.userId === currentUserId) {
            await comment.updateOne({$set:req.body})
            res.status(200).json('Comment Updated!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
} 

export const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const comment = await CommentModel.findById(commentId)
        if(comment.userId === currentUserId) {
            await comment.deleteOne();
            res.status(200).json('Comment Deleted!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const post = await AnswerModel.findById(req.params.answerId);
    
    if (!post) {
      console.log('Post non trouvé');
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    // Vérifier si l'utilisateur a déjà voté
    const existingVoteIndex = post.votes.voters.findIndex(
      v => v?.userId?.toString() === req.user._id
    );

    if (existingVoteIndex > -1) {
      const existingVote = post.votes.voters[existingVoteIndex];
      
      // Si même vote, annuler
      if (existingVote.voteType === voteType) {
        post.votes.voters.splice(existingVoteIndex, 1);
        if (voteType === 'up') post.votes.upvotes -= 1;
        else post.votes.downvotes -= 1;
      } else {
        // Changer de vote
        existingVote.voteType = voteType;
        if (voteType === 'up') {
          post.votes.upvotes += 1;
          post.votes.downvotes -= 1;
        } else {
          post.votes.downvotes += 1;
          post.votes.upvotes -= 1;
        }
      }
    } else {
      // Nouveau vote
      post.votes.voters.push({ userId: req.user._id, voteType });
      if (voteType === 'up') post.votes.upvotes += 1;
      else post.votes.downvotes += 1;
    }

    await post.save();

    // Attribution des points pour le vote
    if (post?.author?.toString() !== req.user._id) {
      await GamificationService.awardPoints(
        post.author, 
        voteType === 'up' ? 'receive_answer_upvote' : 'receive_answer_downvote',
        post._id, 
        'answer'
      );
      await GamificationService.awardPoints(
        req.user._id, 
        voteType === 'up' ? 'give_answer_upvote' : 'give_answer_downvote',
        post._id, 
        'answer'
      );
    }

    res.status(200).json({
      upvotes: post.votes.upvotes,
      downvotes: post.votes.downvotes,
      userVote: post.votes.voters.find(v => v?.userId?.toString() === req.user._id)?.voteType
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({ error: error.message });
  }
};

// Signaler un post
export const reportQuestion =  async (req, res) => {
  try {
    const { reason } = req.body;
    // Implémentation de la logique de signalement
    res.json({ message: 'Contenu signalé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sauvegarder un post
export const saveQuestion =  async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.postId;

    const isSaved = user.savedPosts.includes(postId);
    
    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    res.json({ saved: !isSaved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};