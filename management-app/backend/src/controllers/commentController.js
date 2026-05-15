const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Helper emit
const emitToWorkspace = (req, event, data) => {
  const io = req.app.get('io');
  const workspaceId = req.params.workspaceId;
  io.to(`workspace_${workspaceId}`).emit(event, data);
};

// @desc Get comments for task/issue
exports.getComments = async (req, res, next) => {
  try {
    const { taskId, issueId } = req.params;
    const comments = await Comment.find(taskId ? { task: taskId } : { issue: issueId })
      .populate('author mentions', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

// @desc Add comment
exports.addComment = async (req, res, next) => {
  try {
    const comment = new Comment({
      ...req.body,
      author: req.user._id
    });
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('author mentions', 'name email');

    // Notify mentions
    if (comment.mentions && comment.mentions.length > 0) {
      comment.mentions.forEach(async (mentionId) => {
        const user = await User.findById(mentionId);
        await Notification.create({
          user: mentionId,
          type: 'comment_mention',
          title: 'Mentioned in comment',
          message: ` @${user.name} mentioned you in "${comment.content.substring(0, 50)}..."`,
          relatedId: comment._id,
          model: 'Comment'
        });
      });
    }

    emitToWorkspace(req, 'commentAdded', populated);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

