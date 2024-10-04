import CommentModel from "../Models/commentModel.js"
import PostModel from "../Models/postModel.js"

export const addComment = async (req, res) => {
    try {
        if(!req.body.content) {
            res.status(400).json('Tapez votre commentaire...')
        } else {
            const newComment = new CommentModel(req.body);
            const updatePost = PostModel.findByIdAndUpdate({_id: req.body.postId}, {
                $push: {
                    "comments": {newComment}
                }
            });
            await newComment.save();
            res.status(200).json(newComment)
        }
        
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await CommentModel.find().sort({createdAt: -1}).populate("author", "-_id username firstname lastname profilePicture studyAt domain")
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await CommentModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updatePost = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await CommentModel.findById(postId)
        if(post.userId === currentUserId) {
            await post.updateOne({$set:req.body})
            res.status(200).json('Post Updated!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
} 

export const deletePost = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await CommentModel.findById(postId)
        if(post.userId === currentUserId) {
            await post.deleteOne();
            res.status(200).json('Post Deleted!')
        } else {
            res.status(403).json('Action Forbidden')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const likeDislikePost = async (req, res) => {
    const {currentUserId, postId} = req.body;
    try {
        const post = await CommentModel.findById(postId)
        consola.log(post)
        if(!post.likes.includes(currentUserId)) {
            await post.updateOne({$push: {likes:currentUserId}});
            res.status(200).json('Post Liked!')
        } else {
            await post.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json('Post Unliked!')
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
