import Page from '../models/pageModel.js'

// Créer une nouvelle page
export const createPage = async (req, res) => {
  const {name, type, description, contacts} = req.body;
  try {
    const page = new Page({
      name,
      type,
      description,
      contacts,
      createdBy: req.user?._id,
      admins: [req.user?._id], // L'utilisateur qui crée la page est automatiquement admin
    });

    await page.save();
    res.status(201).json(page);
  } catch (err) {
    console.log(err);    
    res.status(500).json({ error: err.message });
  }
};

// Afficher les pages
export const getPages = async (req, res) => {
    try {
        const pages = await Page.find().sort({createdAt: -1})
        // .populate({
        //     path: 'createdBy',
        //     // select: 'userId profilePicture',
        //     // populate: {
        //     //     path: 'userId',
        //     //     select: 'username firstname lastname',
        //     // }
        // })
        res.status(200).json(pages)
    } catch (error) {
       console.log(error)
        res.status(500).json(error)
    }
};

export const getSinglePage = async (req, res) => {
    const id = req.params.id;
    try {
        const page = await Page.findById(id)
        // .populate({
        //     path: 'author',
        //     select: 'userId profilePicture birthday',
        //     populate: {
        //         path: 'userId',
        //         select: 'username firstname lastname',
        //     }
        // })
        res.status(200).json(page)
    } catch (error) {
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

// S'abonner à une page
export const followPage = async (req, res) => {
  // const { isStudent } = req.body; // Uniquement pour les pages éducation

  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur est déjà abonné
    const isAlreadyFollowing = page.followers.includes(req.user.id);

    if (isAlreadyFollowing) {
      // page.followers.push({ user: req.user.id, isStudent });
      page.followers.pull(req.user.id);
      await page.save();
      console.log('Unfollowed');
    } else {
      // page.followers.push({ user: req.user.id, isStudent });
      page.followers.push(req.user.id);
      await page.save();
      console.log('Followed');
    }    
    res.status(200).json(page);
  } catch (err) {
    console.log(err);
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
