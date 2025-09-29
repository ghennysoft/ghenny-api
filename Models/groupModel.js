const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    }
  }],
  profilePicture: {
    type: String,
    default: ''
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  membershipSetting: {
    type: String,
    enum: ['open', 'approval_required'],
    default: 'open'
  },
  rules: [{
    title: String,
    description: String
  }],
  tags: [String],
  stats: {
    memberCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les recherches
groupSchema.index({ name: 'text', description: 'text', tags: 'text' });
groupSchema.index({ 'members.user': 1 });
groupSchema.index({ admin: 1 });

module.exports = mongoose.model('Group', groupSchema);