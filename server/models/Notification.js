import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },   // Notification content
  is_read: { type: Boolean, default: false },  // Mark notification as read
}, { timestamps: true });

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;
