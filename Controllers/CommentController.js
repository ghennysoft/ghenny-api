import CommentModel from "../Models/commentModel.js";
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

            const find_post = await PostModel.findById(req.body.postId)
            await find_post.updateOne({$push: {"comments": newComment._id}})
            res.status(200).json({message: "Commentaire ajouté avec success!"})
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

export const likeDislikeComment = async (req, res) => {
    const {currentUserId, commentId} = req.body;
    
    try {
        const comment = await CommentModel.findById(commentId)
        if(!comment.likes.includes(currentUserId)) {
            await comment.updateOne({$push: {likes:currentUserId}});
            res.status(200).json({msg: 'Comment Liked!', comment: comment})
        } else {
            await comment.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json({msg: 'Comment Unliked!', comment: comment})
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Get Timeline POsts
export const getTimelinePosts = async (req, res) => {
    const userId = req.params.id;
  
    try {
      const currentUserPosts = await CommentModel.find({ userId: userId });
      const followingPosts = await UserModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "posts",
            localField: "following",
            foreignField: "userId",
            as: "followingPosts",
          },
        },
        {
          $project: {
            followingPosts: 1,
            _id: 0,
          },
        },
      ]);
  
      res
        .status(200)
        .json(currentUserPosts.concat(...followingPosts[0].followingPosts)
        .sort((a,b)=>{
            return b.createdAt - a.createdAt;
        })
        );
    } catch (error) {
      res.status(500).json(error);
    }
  };
