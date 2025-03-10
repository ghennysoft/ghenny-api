import mongoose from "mongoose";

const notificationSchema = mongoose.Schema({
    userId: {type:mongoose.Types.ObjectId, ref: 'Profiles', required: true},
    type: {type: String, required: true}, // Type de notification (ex: "like", "comment", "friend_request")
    content: {type: String, required: true}, // Message de la notification
    read: { type: Boolean, default: false },
    url: { type: String }, // Lien vers le post
},
{
    timestamps: true
});

const NotificationModel = mongoose.model("Notifications", notificationSchema)
export default NotificationModel