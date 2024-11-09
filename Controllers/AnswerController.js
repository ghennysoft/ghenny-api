import AnswerModel from "../Models/answerModel.js";
import QuestionModel from "../Models/questionModel.js";

export const addAnswer = async (req, res) => {
    try {
        if(!req.body.content) {
            res.status(400).json('Tapez votre reponse...')
        } else if(!req.body.questionId) {
            res.status(400).json('Question id empty...')
        } else {
            const newAnswer = new AnswerModel(req.body);
            await newAnswer.save();

            const find_question = await QuestionModel.findById(req.body.questionId)
            await find_question.updateOne({$push: {"answers": newAnswer._id}})
            find_question.save()
            res.status(200).json({
                message: "Reponse ajouté avec success!", 
                answer: newAnswer,
                question: find_question,
            })
        }
    } catch (error) {
        res.status(500).json(error)
    }
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