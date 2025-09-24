import mongoose, { Document, Schema } from 'mongoose';

const MessageSchema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'Profiles', required: true },
  content: String,
  // messageType: { 
  //   type: String, 
  //   enum: ['text', 'image', 'video', 'file', 'sticker'],
  //   required: true 
  // },
  attachments: [String],
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  edited: { type: Boolean, default: false },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'Profiles' }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
}, { timestamps: true });

// Index pour améliorer les performances des requêtes
MessageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model('Message', MessageSchema);