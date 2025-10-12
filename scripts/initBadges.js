const createDefaultBadges = async () => {
  const defaultBadges = [
    {
      name: "🗣️ Curieux",
      description: "A posé 10 questions",
      imageUrl: "/badges/curious.png",
      category: "participation",
      criteria: { type: "questions_count", threshold: 10 },
      rarity: "common"
    },
    {
      name: "💬 Soutien Académique",
      description: "A répondu à 20 questions",
      imageUrl: "/badges/support.png", 
      category: "participation",
      criteria: { type: "answers_count", threshold: 20 },
      rarity: "common"
    },
    {
      name: "🎯 Réponse Validée",
      description: "5 réponses acceptées comme solution",
      imageUrl: "/badges/verified.png",
      category: "expertise", 
      criteria: { type: "accepted_answers", threshold: 5 },
      rarity: "rare"
    },
    {
      name: "🔥 Populaire",
      description: "Une question reçoit 100 vues",
      imageUrl: "/badges/popular.png",
      category: "community",
      criteria: { type: "popular_question", threshold: 100 },
      rarity: "rare"
    },
    {
      name: "🧠 Savant",
      description: "Maintenir 80% de votes positifs",
      imageUrl: "/badges/scholar.png",
      category: "expertise",
      criteria: { type: "positive_ratio", threshold: 80 },
      rarity: "epic"
    },
    {
      name: "⚡ Rapide",
      description: "Répondre à 5 questions dans les 24h",
      imageUrl: "/badges/fast.png",
      category: "participation",
      criteria: { type: "quick_answers", threshold: 5 },
      rarity: "rare"
    }
  ];

  for (const badgeData of defaultBadges) {
    await Badge.findOneAndUpdate(
      { name: badgeData.name },
      badgeData,
      { upsert: true, new: true }
    );
  }
  console.log("✅ Badges par défaut créés avec succès");
};