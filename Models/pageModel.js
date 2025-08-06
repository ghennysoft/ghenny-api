import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['personnal', 'business', 'education'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
  },
  coverPicture: {
    type: String,
  },
  contacts: {
    address: String,
    phoneNumber: String,
    website: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profiles',
    required: true,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profiles',
  }],
  followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profiles'
    // isStudent: { // Uniquement pour les pages éducation
    //   type: Boolean,
    //   default: false,
    // },
  }],
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
    activeYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicYear',
    },
  }
},
{
  timestamps: true
});

const PageModel = mongoose.model("Page", pageSchema)
export default PageModel