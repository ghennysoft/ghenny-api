import QuestionModel from "../Models/questionModel.js"
import SubjectModel from "../Models/subjectModel.js"
import ProfileModel from "../Models/profileModel.js";
import GamificationService from "../utils/gamification.js";

export const addSubject = async (req, res) => {
    try {
        if(!req.body.name && !req.body.color) {
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
        const subjects = await SubjectModel.find().select('_id name color')
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
            const subjects = await SubjectModel.find().select('-_id name')
            const profile = await ProfileModel.findById(req.body.profileId).populate('userId', '-password')
            await profile.updateOne({$push: {"subjects": [...req.body.subjects]}})
            res.status(200).json(profile)
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

export const addQuestion = async (req, res) => {
    const { title, content, tags, category, type } = req.body;
    try {
        if(!title, !content, !category, !type) {
            res.status(400).json('Ajoutez du contenu...')
        } else {
            const newQuestion = await QuestionModel.create({
                title,
                content,
                tags,
                category,
                type,
                author: req.user._id,
                etablissment: req.user.status==='student' ? req.user.university : req.user.school
            });
            await newQuestion.save();

            // Add point
            await GamificationService.awardPoints(req.user._id, 'ask_question', newQuestion._id, 'question');
            res.status(200).json(newQuestion)
        }
    } catch (error) {
        // console.log({error});
        res.status(500).json(error)
    }
}

export const getQuestions = async (req, res) => {
    const {userId} = req.params;
    try {
        const getUser = await ProfileModel.findById(userId)
        const questions = await QuestionModel.find({$or: [{author: getUser._id}, {subjects: {$in: getUser.subjects}}]}).sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'userId profilePicture privileges reputation level experience badges',
            populate: {
              path: 'userId',
              select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'answers',
            populate: {
                path: 'author',
                select: 'userId profilePicture privileges reputation level experience badges',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        // .populate({
        //     path: 'subjects',
        //     select: '_id name color',
        // })
        // console.log({questions});
        res.status(200).json(questions)
    } catch (error) {
        // console.log({error});
        res.status(500).json(error)
    }
}

export const getUserQuestions = async (req, res) => {
    const {userId} = req.params
    try {
        const profile = await ProfileModel.findById(userId)
        const questions = await QuestionModel.find({author: profile._id}).sort({createdAt: -1})
        .populate({
            path: 'author',
            select: 'userId profilePicture -_id',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'answers',
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
            path: 'subjects',
            select: '_id name color',
        })
        res.status(200).json(questions)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSingleQuestion = async (req, res) => {
    const {id, userId} = req.params;
    try {
        const question = await QuestionModel.findById(id)
        .populate({
            path: 'author',
            select: 'userId profilePicture privileges reputation level experience badges',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'answers',
            populate: {
                path: 'author',
                select: 'userId profilePicture privileges reputation level experience badges',
                populate: {
                    path: 'userId',
                    select: 'username firstname lastname',
                }
            }
        })
        // .populate({
        //     path: 'subjects',
        //     select: '_id name color',
        // })

        // Add viewer
        if(userId){
            if(!question.viewers.includes(userId)) {
                await question.updateOne({$push: {viewers:userId}});
            }
        }
        
        res.status(200).json(question)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getSubjectQuestions = async (req, res) => {
    const id = req.params.id;
    try {
        const questions = await QuestionModel.find({subjects: {$in: id}})
        .populate({
            path: 'author',
            select: 'userId profilePicture',
            populate: {
                path: 'userId',
                select: 'username firstname lastname',
            }
        })
        .populate({
            path: 'answers',
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
            path: 'subjects',
            select: '_id name color',
        })
        res.status(200).json(questions)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const updateQuestion = async (req, res) => {
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

export const deleteQuestion = async (req, res) => {
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

export const voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'up' or 'down'
    const post = await QuestionModel.findById(req.params.questionId);
    
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
        voteType === 'up' ? 'receive_question_upvote' : 'receive_question_downvote',
        post._id, 
        'question'
      );
      await GamificationService.awardPoints(
        req.user._id, 
        voteType === 'up' ? 'give_question_upvote' : 'give_question_downvote',
        post._id, 
        'question'
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

export const searchQuestion = async (req, res) => {
  try {
    const { 
      q: searchQuery, 
      category, 
      tags, 
      type, 
      university,
      sortBy = 'recent',
      page = 1,
      limit = 20
    } = req.query;

    let query = { type: { $in: ['question', 'discussion'] } };
    
    // Recherche texte
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
        { tags: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Filtres
    if (category) query.category = category;
    if (type) query.type = type;
    if (university) query.university = university;
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray.map(tag => new RegExp(tag, 'i')) };
    }

    // Tri
    let sortOptions = {};
    switch (sortBy) {
      case 'recent':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { 'votes.upvotes': -1, createdAt: -1 };
        break;
      case 'trending':
        sortOptions = { viewCount: -1, 'votes.upvotes': -1 };
        break;
      case 'unanswered':
        query.answerCount = 0;
        sortOptions = { createdAt: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const posts = await QuestionModel.find(query)
      .populate({
        path: 'author',
        select: 'userId profilePicture privileges reputation level experience badges',
        populate: {
          path: 'userId',
          select: 'username firstname lastname',
        }
      })
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await QuestionModel.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
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