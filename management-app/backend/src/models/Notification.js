const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task_assigned', 'task_updated', 'comment_mention', 'member_added', 'project_progress'],
    required: true
  },
  title: String,
  message: String,
  relatedId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  model: {
    type: String,
    enum: ['Task', 'Issue', 'Project', 'Workspace'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

