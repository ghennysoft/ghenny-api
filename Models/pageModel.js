import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['professional', 'education'],
    required: true,
  },
  category: {
    type: String,
    required: true
  },
  email: {
    type: String,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  profilePicture: {
    type: String,
    default: ''
  },
  coverPicture: {
    type: String,
   default: ''
  },
  address: String,
  phoneNumber: String,
  website: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profiles',
    required: true,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profiles',
    required: true
  }],
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profiles'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  stats: {
    followerCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowFollowers: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: false
    },
    postApprovalRequired: {
      type: Boolean,
      default: false
    },
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profiles',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profiles',
    },
    text: {
      type: String,
      required: true,
    },
  }],

  // For academic pages
  school: {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      unique: true,
    },
    currentYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
    },
  }
},
{
  timestamps: true
});

pageSchema.index({ name: 'text', description: 'text', category: 'text' });
pageSchema.index({ admin: 1 });
pageSchema.index({ 'followers.user': 1 });

const PageModel = mongoose.model("Page", pageSchema)
export default PageModel