import CommentModel from "../Models/commentModel.js";
import NotificationModel from "../Models/notificationModel.js";
import PostModel from "../Models/postModel.js";

export const addComment = async (req, res) => {
    try {
        if(!req.body.content) {
            res.status(400).json('Tapez votre commentaire...')
        } else if(!req.body.postId) {
            res.status(400).json('Post id empty...')
        } else {
            const newComment = new CommentModel(req.body);
            await newComment.save();

            const post = await PostModel.findById(req.body.postId)
            await post.updateOne({$push: {"comments": newComment._id}})

            // Envoyer une notification à l'auteur du post
            if(req.body.author !== post.author.toString()) {
                const notification = new NotificationModel({
                    senderId: newComment.author,
                    receiverId: post.author,
                    type: 'comment',
                    postId: req.body.postId,
                    commentId: newComment._id,
                });
                await notification.save();
            };

            res.status(200).json(newComment)
        }
    } catch (error) {
        // console.log(error);  
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

export const likeDislikeComment = async (req, res) => {
    const {currentUserId, commentId} = req.body;
    
    try {
        const comment = await CommentModel.findById(commentId)
        if (!comment) {
            return res.status(404).json({ message: "Post non trouvé" });
        }

        // Vérifier si l'utilisateur a déjà liké
        const alreadyLiked = comment.likes.find(like => 
            like.user.toString() === currentUserId
        );

        if(alreadyLiked) {
            // Retirer le like
            await CommentModel.findByIdAndUpdate(
                commentId,
                { $pull: { likes: { user: currentUserId } } }
            );
            
            res.status(200).json({ 
                message: "Like retiré",
                action: "removed"
            });
        } else {
            // Ajouter le like
            await CommentModel.findByIdAndUpdate(
                commentId,
                { 
                    $push: { 
                        likes: { 
                            user: currentUserId, 
                            likedAt: new Date() 
                        } 
                    } 
                }
            );

            // Envoyer une notification à l'auteur du commentaire
            if(currentUserId !== comment.author.toString()) {
                const notification = new NotificationModel({
                    senderId: currentUserId,
                    receiverId: comment.author,
                    type: 'likeComment',
                    postId: comment.postId,
                    commentId: commentId,
                });
                await notification.save();
            };

            res.status(200).json({ 
                message: "Like ajouté",
                action: "added"
            });
        }
    } catch (error) {
        res.status(500).json(error)
    }
}
