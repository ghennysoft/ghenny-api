import PostModel from "../Models/postModel.js"
import ProfileModel from "../Models/profileModel.js";
import NotificationModel from "../Models/notificationModel.js";

export const createPost = async (req, res) => {
    const {author, content, postBg} = req.body;
    
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
           postBg: JSON.parse(postBg), 
        });
        const resp = await newPost.save();

        // Récupérer les abonnés de l'utilisateur
        const user = await ProfileModel.findById(newPost.author).populate('userId pinned');
        const pinned = user.pinned;

        // Créer une notification pour chaque abonné
        const notifications = pinned.map(pin => ({
            senderId: author,
            receiverId: pin._id,
            type: 'post',
            postId: newPost._id,
        }));
        await NotificationModel.insertMany(notifications);
        
        res.status(201).json({newPost, user})
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
            
            // Envoyer une notification à l'auteur du post
            if(currentUserId !== post.author.toString()) {
                const notification = new NotificationModel({
                    senderId: currentUserId,
                    receiverId: post.author,
                    type: 'like',
                    postId: post._id,
                });
                await notification.save();           
            };
            
            res.status(200).json(post)
        } else {
            await post.updateOne({$pull: {likes:currentUserId}});
            res.status(200).json(post)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getTimelinePosts = async (req, res) => {
    const id = req.user?._id;

    try {
        // Récupérer l'utilisateur actuel
        const currentUser = await ProfileModel.findById(id).lean();
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Définir la requête pour les utilisateurs similaires
        let matchQuery;
        if (currentUser.status === 'Pupil') {
            matchQuery = {
                $or: [
                    { school: currentUser.school },
                    { option: currentUser.option },
                    { _id: { $in: currentUser.pins } }
                ]
            };
        } else if (currentUser.status === 'Student') {
            matchQuery = {
                $or: [
                    { university: currentUser.university },
                    { filiere: currentUser.filiere },
                    { _id: { $in: currentUser.pins } }
                ]
            };
        } else if (currentUser.status === 'Other') {
            matchQuery = {
                $or: [
                    { status: currentUser.status },
                    { _id: { $in: currentUser.pins } }
                ]
            };
        } else {
            return res.status(200).json({ userFeed: [], page: 1, totalPosts: 0, hasNextPage: false });
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const pageSize = 5;
        const skip = (page - 1) * pageSize;

        // Aggregation pour récupérer les posts des utilisateurs similaires
        const aggregationPipeline = [
            // Étape 1 : Trouver les utilisateurs similaires
            {
                $match: matchQuery
            },
            // Étape 2 : Joindre les posts des utilisateurs similaires
            {
                $lookup: {
                    from: 'posts', // Nom de la collection des posts
                    localField: '_id',
                    foreignField: 'author',
                    as: 'posts'
                }
            },
            // Étape 3 : Déplier les posts
            {
                $unwind: '$posts'
            },
            // Étape 4 : Trier les posts par date de création
            {
                $sort: { 'posts.createdAt': -1 }
            },
            // Étape 5 : Pagination
            {
                $skip: skip
            },
            {
                $limit: pageSize
            },
            // Étape 6 : Joindre les informations de l'auteur (Profile)
            {
                $lookup: {
                    from: 'profiles', // Nom de la collection des profils
                    localField: 'posts.author',
                    foreignField: '_id',
                    as: 'authorInfo'
                }
            },
            {
                $unwind: '$authorInfo'
            },
            // Étape 7 : Joindre les informations de l'utilisateur (User)
            {
                $lookup: {
                    from: 'users', // Nom de la collection des utilisateurs
                    localField: 'authorInfo.userId',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $lookup: {
                    from: 'comments',
                    localField: 'posts.comments',
                    foreignField: '_id',
                    as: 'commentsInfo',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'profiles',
                                localField: 'author',
                                foreignField: '_id',
                                as: 'authorProfile'
                            }
                        },
                        { $unwind: '$authorProfile' },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'authorProfile.userId',
                                foreignField: '_id',
                                as: 'authorUser'
                            }
                        },
                        { $unwind: '$authorUser' },
                        {
                            $project: {
                                _id: 1,
                                content: 1,
                                reply: 1,
                                likes: 1,
                                createdAt: 1,
                                author: {
                                    profilePicture: '$authorProfile.profilePicture',
                                    userId: {
                                        firstname: '$authorUser.firstname',
                                        lastname: '$authorUser.lastname',
                                        username: '$authorUser.username'
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            // Étape 9 : Formater le résultat
            {
                $project: {
                    _id: '$posts._id',
                    content: '$posts.content',
                    postBg: '$posts.postBg',
                    media: '$posts.media',
                    likes: '$posts.likes',
                    createdAt: '$posts.createdAt',
                    author: {
                        profilePicture: '$authorInfo.profilePicture',
                        status: '$authorInfo.status',
                        school: '$authorInfo.school',
                        option: '$authorInfo.option',
                        university: '$authorInfo.university',
                        filiere: '$authorInfo.filiere',
                        profession: '$authorInfo.profession',
                        userId: {
                            firstname: '$userInfo.firstname',
                            lastname: '$userInfo.lastname',
                            username: '$userInfo.username'
                        }
                    },
                    comments: '$commentsInfo'
                }
            }
            // // Étape 8 : Joindre les commentaires
            // {
            //     $lookup: {
            //         from: 'comments', // Nom de la collection des commentaires
            //         localField: 'posts.comments',
            //         foreignField: '_id',
            //         as: 'commentsInfo'
            //     }
            // },
            // // Étape 9 : Formater le résultat
            // {
            //     $project: {
            //         _id: '$posts._id',
            //         content: '$posts.content',
            //         postBg: '$posts.postBg',
            //         media: '$posts.media',
            //         likes: '$posts.likes',
            //         createdAt: '$posts.createdAt',
            //         author: {
            //             profilePicture: '$authorInfo.profilePicture',
            //             status: '$authorInfo.status',
            //             school: '$authorInfo.school',
            //             option: '$authorInfo.option',
            //             university: '$authorInfo.university',
            //             filiere: '$authorInfo.filiere',
            //             userId: {
            //                 firstname: '$userInfo.firstname',
            //                 lastname: '$userInfo.lastname',
            //                 username: '$userInfo.username'
            //             }
            //         },
            //         comments: {
            //             $map: {
            //                 input: '$commentsInfo',
            //                 as: 'comment',
            //                 in: {
            //                     _id: '$$comment._id',
            //                     content: '$$comment.content',
            //                     authorId: '$$comment.author',
            //                     author: {
            //                         userId: '$$comment.author.userId',
            //                         profilePicture: '$$comment.author.profilePicture',
            //                         status: '$$comment.author.status',
            //                         school: '$$comment.author.school',
            //                         option: '$$comment.author.option',
            //                         university: '$$comment.author.university',
            //                         filiere: '$$comment.author.filiere',
            //                         user: {
            //                             firstname: '$$comment.author.userInfo.firstname',
            //                             lastname: '$$comment.author.userInfo.lastname',
            //                             username: '$$comment.author.userInfo.username'
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }
        ];

        // Exécuter l'aggregation
        const userFeed = await ProfileModel.aggregate(aggregationPipeline);

        // Compter le nombre total de posts
        const totalPosts = await ProfileModel.aggregate([
            { $match: matchQuery },
            { $lookup: { from: 'posts', localField: '_id', foreignField: 'author', as: 'posts' } },
            { $unwind: '$posts' },
            { $count: 'totalPosts' }
        ]);

        // Vérifier s'il y a une page suivante
        const hasNextPage = skip + pageSize < (totalPosts[0]?.totalPosts || 0);

        // Retourner le résultat
        res.status(200).json({ userFeed, page, totalPosts: totalPosts[0]?.totalPosts || 0, hasNextPage });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
