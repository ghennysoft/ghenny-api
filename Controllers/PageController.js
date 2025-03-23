const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const auth = require('../middleware/auth');

// Créer une nouvelle page
router.post('/', auth, async (req, res) => {
  const { name, description, type } = req.body;

  try {
    const page = new Page({
      name,
      description,
      type,
      createdBy: req.user.id,
      admins: [req.user.id], // L'utilisateur qui crée la page est automatiquement admin
    });

    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un administrateur à une page
router.post('/:id/admins', auth, async (req, res) => {
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
});

// S'abonner à une page
router.post('/:id/follow', auth, async (req, res) => {
  const { isStudent } = req.body; // Uniquement pour les pages éducation

  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // Vérifier si l'utilisateur est déjà abonné
    const isAlreadyFollowing = page.followers.some(
      (follower) => follower.user.toString() === req.user.id
    );

    if (isAlreadyFollowing) {
      return res.status(400).json({ msg: 'Already following this page' });
    }

    page.followers.push({ user: req.user.id, isStudent });
    await page.save();
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Noter une page
router.post('/:id/rate', auth, async (req, res) => {
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
});

// Ajouter un commentaire à une page
router.post('/:id/comments', auth, async (req, res) => {
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
});

module.exports = router;