import NotificationModel from '../Models/notificationModel.js';
import Page from '../Models/pageModel.js'
import PostModel from '../Models/postModel.js';

// Créer une nouvelle page
export const createPage = async (req, res) => {
  const {name, type, category, description, address, website, email, phoneNumber} = req.body;
  try {
    const page = new Page({
      name,
      type,
      category,
      description,
      address,
      website,
      email,
      phoneNumber,
      createdBy: req.user?._id,
      admins: [{ 
        user: req.user?._id, 
        addedAt: new Date() 
      } ], // L'utilisateur qui crée la page est automatiquement admin
    });

    await page.save();
    res.status(201).json(page);
  } catch (err) {
    // console.log(err);    
    res.status(500).json({ error: err.message });
  }
};

// Afficher les pages
export const getPages = async (req, res) => {
    try {
        const pages = await Page.find().sort({createdAt: -1})
        res.status(200).json(pages)
    } catch (error) {
      //  console.log(error)
        res.status(500).json(error)
    }
};

export const getSinglePage = async (req, res) => {
  const id = req.params.id;

  try {
    const page = await Page.findById(id)
    res.status(200).json(page)
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

// S'abonner à une page
export const followPage = async (req, res) => {
  const pageId = req.params.id;
  const currentUserId = req.user._id;

  try {
    const page = await Page.findById(pageId);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur est déjà abonné
    const isAlreadyFollowing = page.followers.some(follower => 
      follower.user.toString() === currentUserId
    );

    if (isAlreadyFollowing) {
      await Page.findByIdAndUpdate(
        pageId,
        { $pull: { followers: { user: currentUserId } } }
      );

       // CORRECTION : Mettre à jour les stats
      await Page.findByIdAndUpdate(
        pageId,
        { $inc: { 'stats.followerCount': -1 } }
      );  
      
      return res.status(200).json({ 
        message: "Suivi retiré",
        action: "removed"
      });
    } else {
      await Page.findByIdAndUpdate(
        pageId,
        { 
          $push: { 
            followers: { 
              user: currentUserId,
              followedAt: new Date()
            } 
          } 
        }
      );

      await Page.findByIdAndUpdate(
        pageId,
        { $inc: { 'stats.followerCount': 1 } }
      );

      // CORRECTION : Envoyer une notification seulement si l'utilisateur n'est pas admin
      const isAdmin = page.admins.some(admin => 
        admin.user.toString() === currentUserId
      );
      
      if (!isAdmin) {
        // Créer une notification pour chaque administrateur
        // const notifications = page.admins.map(admin => ({
        //   senderId: currentUserId,
        //   receiverId: admin.user,
        //   type: 'followPage',
        //   pageId: pageId,
        // }));
        // await NotificationModel.insertMany(notifications);
      }
      
      return res.status(200).json({ 
        message: "Page suivi",
        action: "added"
      });
    }    
  } catch (err) {
    // console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// Créer un post sur une page
export const createPagePost = async (req, res) => {
  try {
    const { content, media } = req.body;
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page non trouvée'
      });
    }

    // Vérifier que l'utilisateur est admin
    if (page.admin.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'admin peut poster sur cette page'
      });
    }

    const post = new PostModel({
      content,
      media: media || [],
      author: req.user._id,
      postType: 'page',
      target: req.params.id,
      visibility: 'page_followers'
    });

    await post.save();

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

export const getPagePosts = async (req, res) => {
  try {
    const post = await PostModel.find({postType: 'page', target: req.params.id})
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
    console.log(error);
    res.status(500).json(error)
  }
}

// Ajouter un administrateur à une page 
export const addPageAdmin = async (req, res) => {
  const { userId } = req.body;

  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur est un admin de la page
    if (!page.admins.includes(req.user.id)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    page.admins.push(userId);
    await page.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




// Editer l'école et l'année en cours 
export const editSchoolAndCurrentYear = async (req, res) => {
  const { pageId, schoolId, yearId, status } = req.body;
  
  try {
    const page = await Page.findById(pageId);
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur est un admin de la page
    if (schoolId) {
      page.school.schoolId = schoolId;
    }
    if (yearId) {
      page.school.currentYearId = yearId;
    }
    page.school.status = status;

    await page.save();
    res.status(200).json(page.school);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Noter une page
export const notePage = async (req, res) => {
  const { rating } = req.body;

  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur a déjà noté la page
    const existingRating = page.ratings.find(
      (r) => r.user.toString() === req.user.id
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      page.ratings.push({ user: req.user.id, rating });
    }

    await page.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ajouter un commentaire à une page
export const commentPage = async (req, res) => {
  const { text } = req.body;

  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    page.comments.push({ user: req.user.id, text });
    await page.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
