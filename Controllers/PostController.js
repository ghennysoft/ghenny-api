import PostModel from "../Models/postModel.js"
import ProfileModel from "../Models/profileModel.js";

export const createPost = async (req, res) => {
    try {
        const newPost = new PostModel(req.body);
        await newPost.save();
        res.status(200).json(newPost)
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
                select: 'userId profilePicture status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getPost = async (req, res) => {
    const id = req.params.id;
    try {
        const post = await PostModel.findById(id)
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture status school option university filiere profession entreprise',
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

// Get Timeline Posts
export const    getTimelinePosts = async (req, res) => {
    const {id} = req.params;
  
    try {
        let sameUser;
        const currentUser = await ProfileModel.findById(id);
        if(currentUser.status==='Pupil'){
            sameUser = await ProfileModel.find({$or: [{school: currentUser.school}, {option: currentUser.option}, {_id: [...currentUser.followings]}]}).populate('userId', 'firstname lastname')
        }
        else if(currentUser.status==='Student'){
            sameUser = await ProfileModel.find({$or: [{university: currentUser.university}, {filiere: currentUser.filiere}, {_id: [...currentUser.followings]}]}).populate('userId', 'firstname lastname')
        }
        else{
            sameUser = null;
        }

        let idArr = [];
        sameUser.forEach(item=>{
            idArr.push(item._id)
        })

        let userFeed;
        if(idArr.length!==0){
            userFeed = await PostModel.find({author: {$in: idArr}}).sort({createdAt: -1})
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'userId profilePicture status school option university filiere profession entreprise',
                    populate: {
                        path: 'userId',
                        select: 'username firstname lastname',
                    }
                }
            })
            .populate({
                path: 'author',
                select: 'userId profilePicture status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            })
        }
        res.status(200).json({sameUser, userFeed});
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
      
    }
};
