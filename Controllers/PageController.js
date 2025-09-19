import Page from '../Models/pageModel.js'

// Créer une nouvelle page
export const createPage = async (req, res) => {
  const {name, type, description, address, website, email, phoneNumber} = req.body;
  try {
    const page = new Page({
      name,
      type,
      description,
      address,
      website,
      email,
      phoneNumber,
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
    res.status(200).json(page)
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

// S'abonner à une page
export const followPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur est déjà abonné
    const isAlreadyFollowing = page.followers.includes(req.user._id);

    if (isAlreadyFollowing) {
      page.followers.pull(req.user._id);
      await page.save();
    } else {
      page.followers.push(req.user._id);
      await page.save();
    }    
    res.status(200).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
