import mongoose from "mongoose";

const ProfileSchema = mongoose.Schema(
    {
        // User id
        userId: {
            type:mongoose.Types.ObjectId, 
            ref: 'Users', 
            required: true,
        },


        // Complete Infos
        status: {
            type: String,
            enum: ['Pupil', 'Student', 'Other'],
        },

        school: {
            type: String,
        },
        option: {
            type: String,
        },
        schoolStartYear: {
            type: Number,
        },
        schoolEndYear: {
            type: Number,
        },

        university: {
            type: String,
        },
        filiere: {
            type: String,
        },
        universityStartYear: {
            type: Number,
        },
        universityEndYear: {
            type: Number,
        },

        entreprise: {
            type: String,
        },
        profession: {
            type: String,
        },
        
        
        // Others Infos
        gender: {
            type: String,
        },
        birthday: {
            type: Date,
        },
        profilePicture: {
            url: String,
            type: {
                type: String,
                enum: ['image', 'video', 'document']
            }
        },
        coverPicture: {
            url: String,
            type: {
                type: String,
                enum: ['image', 'video', 'document']
            }
        },
        bio: {
            type: String,
            maxlength: 200,
            default:'',
        },
        followings: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
            },
            followedAt: {
              type: Date,
              default: Date.now
            }
        }],
        followers: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
            },
            followedAt: {
              type: Date,
              default: Date.now
            }
        }],
        blockedProfiles: [{
            user: {
              type: mongoose.Schema.Types.ObjectId,
            },
            blockedAt: {
              type: Date,
              default: Date.now
            }
        }],
        subjects: [{type:mongoose.Types.ObjectId, ref: 'Subjects'}],
        isProfileCompleted: {
            type: Boolean,
            default: false
        },


        // Forum quotes
        reputation: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        experience: { type: Number, default: 0 },
        badges: [{
            badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badges' },
            earnedAt: { type: Date, default: Date.now }
        }],
        privileges: {
            canVote: { type: Boolean, default: false },
            canModerate: { type: Boolean, default: false },
            canCreateTags: { type: Boolean, default: false }
        }
    },
    {timestamps: true},
)

const ProfileModel = mongoose.model("Profiles", ProfileSchema)

// ProfileModel.collection.createIndex({school: 1});
// ProfileModel.collection.createIndex({option: 1});
// ProfileModel.collection.createIndex({university: 1});
// ProfileModel.collection.createIndex({filiere: 1});
// ProfileModel.collection.createIndex({school: 1, option: 1});
// ProfileModel.collection.createIndex({pins: 1});

// Méthode pour mettre à jour les niveaux
ProfileSchema.methods.updateLevel = function() {
  const levels = [0, 100, 500, 1000, 2000]; // Seuils de niveau
  for (let i = levels.length - 1; i >= 0; i--) {
    if (this.reputation >= levels[i]) {
      this.level = i + 1;
      break;
    }
  }
  
  // Mise à jour des privilèges selon le niveau
  this.privileges.canVote = this.level >= 2;
  this.privileges.canModerate = this.level >= 4;
  this.privileges.canCreateTags = this.level >= 5;
};

export default ProfileModel