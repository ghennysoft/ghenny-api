import QuestionModel from "../Models/questionModel.js"
import SubjectModel from "../Models/subjectModel.js"
import ProfileModel from "../Models/profileModel.js";

export const addSubject = async (req, res) => {
    try {
        if(!req.body.name) {
            res.status(400).json('Ajoutez un sujet...')
        } else {
            const newSubject = new SubjectModel(req.body);
            await newSubject.save();
            res.status(200).json(newSubject)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSubjects = async (req, res) => {
    try {
        const subjects = await SubjectModel.find().select('_id name')
        res.status(200).json(subjects)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addUserSubject = async (req, res) => {
    try {
        if(!req.body.subjects) {
            res.status(400).json('Ajoutez des sujets...')
        } else if(!req.body.profileId) {
            res.status(400).json('Profile non défini')
        } else {
            const profile = await ProfileModel.findById(req.body.profileId).populate('userId', '-password')
            await profile.updateOne({$push: {"subjects": req.body.subjects}})
            res.status(200).json(profile)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}




export const addQuestion = async (req, res) => {
    try {
        if(!req.body.content && !req.body.media) {
            res.status(400).json('Ajoutez du contenu...')
        } else {
            const newQuestion = new QuestionModel(req.body);
            await newQuestion.save();
            res.status(200).json(newQuestion)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await PostModel.find().sort({createdAt: -1})
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture status studyAt domain',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture status studyAt domain',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
        console.log(error);
        
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getUserPost = async (req, res) => {
    const id = req.params.id;
    try {
        const profile = await ProfileModel.findById(id)
        const post = await PostModel.find({author: profile._id})
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture studyAt domain',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture studyAt domain',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updatePost = async (req, res) => {
    const postId = req.params.id;
    const {currentUserId} = req.body;
    try {
        const post = await PostModel.findById(postId)
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
        const post = await PostModel.findById(postId)
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
        const post = await PostModel.findById(postId)
        console.log(post)
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
      const currentUserPosts = await PostModel.find({ userId: userId });
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