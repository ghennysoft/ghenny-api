import NotificationModel from "../Models/notificationModel.js"

export const getUserNotifications = async (req, res) => {  
    const {currentUser} = req.params;  
    try {
        const notifications = await NotificationModel.find({receiverId: currentUser}).sort({createdAt: -1})
        .populate({
            path: 'senderId',
            select: 'userId profilePicture',
            populate: {
                path: 'userId',
                select: 'firstname lastname',
            }
        })
        .populate({
            path: 'receiverId',
            select: 'userId profilePicture',
            populate: {
                path: 'userId',
                select: 'firstname lastname',
            }
        })
        const unreadNotifications = await NotificationModel.find({receiverId: currentUser, read: false})
        res.status(200).json({notifications, unreads: unreadNotifications.length})
    } catch (error) {
        console.log(error);
        
        res.status(500).json(error)
    }
}
