const Issue = require('../models/Issue');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper emit
const emitToWorkspace = (req, event, data) => {
  const io = req.app.get('io');
  const workspaceId = req.params.workspaceId;
  io.to(`workspace_${workspaceId}`).emit(event, data);
};

// @desc Get issues for project
exports.getIssues = async (req, res, next) => {
  try {
    const issues = await Issue.find({ project: req.params.projectId })
      .populate('reporter assignee', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: issues.length, data: issues });
  } catch (error) {
    next(error);
  }
};

// @desc Create issue
exports.createIssue = async (req, res, next) => {
  try {
    const issue = new Issue({
      ...req.body,
      project: req.params.projectId,
      reporter: req.user._id
    });
    await issue.save();

    const populatedIssue = await Issue.findById(issue._id).populate('reporter assignee project', 'name title');
    emitToWorkspace(req, 'issueCreated', populatedIssue);
    res.status(201).json({ success: true, data: populatedIssue });
  } catch (error) {
    next(error);
  }
};

// @desc Update issue
exports.updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.issueId,
      req.body,
      { new: true, runValidators: true }
    ).populate('reporter assignee project', 'name title');

    emitToWorkspace(req, 'issueUpdated', issue);
    res.json({ success: true, data: issue });
  } catch (error) {
    next(error);
  }
};

// @desc Delete issue
exports.deleteIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.issueId);
    emitToWorkspace(req, 'issueDeleted', { id: req.params.issueId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

