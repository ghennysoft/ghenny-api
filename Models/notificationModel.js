import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    senderId: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true},
    receiverId: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true},
    postId: {type:mongoose.Types.ObjectId, ref: 'Posts' }, // Lien vers le post
    commentId: {type:mongoose.Types.ObjectId, ref: 'Comments' }, // Lien vers le commentaire
    type: {type: String, required: true}, // Type de notification (ex: "like", "comment", "friend_request")
    read: { type: Boolean, default: false },
},
{
    timestamps: true
});

const NotificationModel = mongoose.model("Notifications", notificationSchema)
export default NotificationModel