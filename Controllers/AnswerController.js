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

export const acceptAnswer = async (req,res) => {
    const { id } = req.params; // answer id
    const ans = await AnswerModel.findById(id).populate('questionId');
    if(!ans) return res.status(404).json({message:'Answer not found'});
    // Only question author or teacher/admin can accept
    const question = await QuestionModel.findById(ans.question._id);
    if(!question) return res.status(404).json({message:'Question not found'});
    if(question.author.toString() !== req.user._id.toString()){
        return res.status(403).json({message:'Not allowed'});
    }
    ans.isAccepted = true;
    await ans.save();
    question.isSolved = true;
    await question.save();

    // Add point to answer author
} 

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

export const likeAnswer = async (req, res) => {
    const {currentUserId, answerId} = req.body;
    try {
        const answer = await AnswerModel.findById(answerId)
        if(!answer.likes.includes(currentUserId)) {
            if(!answer.dislikes.includes(currentUserId)) {
                await answer.updateOne({$push: {likes:currentUserId}});
                res.status(200).json('Answer push Like!')
            } else {
                await answer.updateOne({$pull: {dislikes:currentUserId}});
                await answer.updateOne({$push: {likes:currentUserId}});
                res.status(200).json('Answer pull dislike & push like!')
            }
        } else {
            await answer.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json('Answer pull like!')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const dislikeAnswer = async (req, res) => {
    const {currentUserId, answerId} = req.body;
    try {
        const answer = await AnswerModel.findById(answerId)
        if(!answer.dislikes.includes(currentUserId)) {
            if(!answer.likes.includes(currentUserId)) {
                await answer.updateOne({$push: {dislikes:currentUserId}});
                res.status(200).json('Answer push dislike!')
            } else {
                await answer.updateOne({$pull: {likes:currentUserId}});
                await answer.updateOne({$push: {dislikes:currentUserId}});
                res.status(200).json('Answer pull like & push dislike!')
            }
        } else {
            await answer.updateOne({$pull: {dislikes:currentUserId}});
            res.status(200).json('Answer pull dislike!')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}