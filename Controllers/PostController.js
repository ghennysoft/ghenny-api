import PostModel from "../Models/postModel.js"
import ProfileModel from "../Models/profileModel.js";

export const createPost = async (req, res) => {
    const {author, content, media, postBg} = req.body;

    let postMedia = [];
    if(req.files.length!==0){
        req.files.forEach(file => {
            postMedia.push({
                key: file.key,
                location: file.location,
                url: process.env.AWS_CLOUDFRONT_DOMAIN+file.key,
            });
        });
    }
    
    try {
        const newPost = new PostModel({
           author,
           content,
           media: postMedia,
           postBg, 
        });
        await newPost.save();
        res.status(200).json(newPost)
    } catch (error) {
        // res.status(500).json(error)
    }
}

export const getAllPosts = async (req, res) => {  
    const currentUser = req.user;  
    try {
        const posts = await PostModel.find().sort({createdAt: -1})
        .populate({
            path: 'comments',
            populate: {
                path: 'author',
                select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture birthday status school option university filiere profession entreprise',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        res.status(200).json({currentUser, posts})
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
                select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        .populate({
            path: 'author',
            select: 'userId profilePicture birthday status school option university filiere profession entreprise',
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
            res.status(200).json(post)
        } else {
            await post.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json(post)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Get Timeline Posts
export const getTimelinePosts = async (req, res) => {
    const id = req.user?._id;    
    try {
        let sameUser;
        const currentUser = await ProfileModel.findById(id);
        if(currentUser.status==='Pupil'){
            sameUser = await ProfileModel.find({$or: [{school: currentUser.school}, {option: currentUser.option}, {_id: [...currentUser.pins]}]}).populate('userId', 'firstname lastname')
        }
        else if(currentUser.status==='Student'){
            sameUser = await ProfileModel.find({$or: [{university: currentUser.university}, {filiere: currentUser.filiere}, {_id: [...currentUser.pins]}]}).populate('userId', 'firstname lastname')
        }
        else if(currentUser.status==='Other'){
            sameUser = await ProfileModel.find({$or: [{status: currentUser.status}, {_id: [...currentUser.pins]}]}).populate('userId', 'firstname lastname').select('userId status');
        }
        else{
            sameUser = [];
        }

        let idArr = [];
        sameUser.forEach(item=>{
            idArr.push(item._id)
        })


        const page = parseInt(req.query.page) || 1; // page courante
        const pageSize = 5; // Nombre d'articles par page
        const skip = (page - 1) * pageSize; // Calculer combien de documents à ignorer
        
        let userFeed;
        let totalPosts;
        let hasNextPage;
        if(idArr.length!==0){
            const posts = await PostModel.find({author: {$in: idArr}})
            userFeed = await PostModel.find({author: {$in: idArr}})
            .sort({createdAt: -1})
            .skip(skip)
            .limit(pageSize)
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                    populate: {
                        path: 'userId',
                        select: 'username firstname lastname',
                    }
                }
            })
            .populate({
                path: 'author',
                select: 'userId profilePicture birthday status school option university filiere profession entreprise',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            })

            // Vérifier si nous avons des articles suivants
            totalPosts = posts.length;  // Nombre de documents
            hasNextPage = skip + pageSize < totalPosts;

            // for(const data of userFeed){
            //     data.media.forEach(async item => {
            //         // const params = {
            //         //     Bucket: process.env.AWS_BUCKET_NAME,
            //         //     Key: item.key,
            //         // }
            //         // const command = new GetObjectCommand(params);
            //         // const uri = await getSignedUrl(s3Client, command)

            //         const uri = await getS3URL(item)
            //         item.url = uri;
            //     })
            // }
        }
        
        res.status(200).json({userFeed, page, totalPosts, hasNextPage});
    } catch (error) {
      res.status(500).json(error);
    }
};
