const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task'
  },
  issue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Issue'
  },
  mentions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

commentSchema.index({ task: 1, createdAt: -1 });
commentSchema.index({ issue: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);

