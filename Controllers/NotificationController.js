import NotificationModel from "../Models/notificationModel.js"

export const getUserNotifications = async (req, res) => {  
    const {currentUser} = req.params;  
    try {
        const notifications = await NotificationModel.find({receiverId: currentUser}).sort({createdAt: -1})
        .populate({
            path: 'senderId',
            select: 'userId profilePicture birthday',
            populate: {
                path: 'userId',
                select: 'firstname lastname',
            }
        })
        .populate({
            path: 'receiverId',
            select: 'userId profilePicture birthday',
            populate: {
                path: 'userId',
                select: 'firstname lastname',
            }
        })
        .populate({
            path: 'postId',
            select: 'content media comments',
            populate: {
                path: 'comments',
                select: 'author content',
            }
        })

        const unreadNotifications = await NotificationModel.find({receiverId: currentUser, read: false})
        res.status(200).json({notifications, unreads: unreadNotifications.length})
    } catch (error) {
        res.status(500).json(error)
    }
}

export const readNotification = async (req, res) => {  
    const {id} = req.body;
    try {
        const notification = await NotificationModel.findById(id)
        notification.read = true;
        notification.save();
        
        res.status(200).json(notification)
    } catch (error) {
        res.status(500).json(error)
    }
}
