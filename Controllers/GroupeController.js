import Group from '../models/Group';
import Post from '../models/Post';
import User from '../models/User';

// Créer un groupe
export const createGroup = async (req, res) => {
  try {
    const { name, description, privacy, membershipSetting, rules, tags } = req.body;
    
    const group = new Group({
      name,
      description,
      admin: req.userId,
      privacy: privacy || 'public',
      membershipSetting: membershipSetting || 'open',
      rules: rules || [],
      tags: tags || []
    });

    // Ajouter l'admin comme membre
    group.members.push({
      user: req.userId,
      role: 'moderator'
    });

    await group.save();
    
    // Mettre à jour les stats
    group.stats.memberCount = group.members.length;
    await group.save();

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Rejoindre un groupe
export const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier si l'utilisateur est déjà membre
    const isMember = group.members.some(member => 
      member.user.toString() === req.userId
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'Vous êtes déjà membre de ce groupe'
      });
    }

    if (group.privacy === 'private' || group.membershipSetting === 'approval_required') {
      // Gérer les demandes d'adhésion en attente
      return res.status(200).json({
        success: true,
        message: 'Demande d\'adhésion envoyée pour approbation',
        requiresApproval: true
      });
    }

    // Ajouter directement comme membre
    group.members.push({
      user: req.userId,
      role: 'member'
    });

    group.stats.memberCount = group.members.length;
    await group.save();

    res.json({
      success: true,
      message: 'Vous avez rejoint le groupe',
      requiresApproval: false
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Créer un post dans un groupe
export const createGroupPost = async (req, res) => {
  try {
    const { content, media, visibility } = req.body;
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Groupe non trouvé'
      });
    }

    // Vérifier l'appartenance au groupe
    const isMember = group.members.some(member => 
      member.user.toString() === req.userId
    );

    if (!isMember && group.privacy === 'private') {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être membre pour poster dans ce groupe'
      });
    }

    const post = new Post({
      content,
      media: media || [],
      author: req.userId,
      postType: 'group',
      target: req.params.groupId,
      targetModel: 'Group',
      visibility: visibility || 'group_members',
      status: group.settings.postApprovalRequired ? 'pending' : 'published'
    });

    await post.save();

    // Mettre à jour le compteur de posts du groupe
    group.stats.postCount += 1;
    await group.save();

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Récupérer les posts d'un groupe
export const getGroupPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      postType: 'group',
      target: req.params.groupId,
      status: 'published'
    })
    .populate('author', 'name profilePicture')
    .populate('comments.user', 'name profilePicture')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Post.countDocuments({
      postType: 'group',
      target: req.params.groupId,
      status: 'published'
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};