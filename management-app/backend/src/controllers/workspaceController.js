const Workspace = require('../models/Workspace');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc Get workspaces for user
// @route GET /api/workspaces
exports.getWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await Workspace.find({ 
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner members', 'name email');
    res.json({ success: true, count: workspaces.length, data: workspaces });
  } catch (error) {
    next(error);
  }
};

// @desc Create workspace
// @route POST /api/workspaces
exports.createWorkspace = async (req, res, next) => {
  try {
    const workspace = new Workspace({
      ...req.body,
      owner: req.user._id
    });
    await workspace.save();

    // Notify members
    if (req.body.members && req.body.members.length > 0) {
      req.body.members.forEach(async (memberId) => {
        await Notification.create({
          user: memberId,
          type: 'member_added',
          title: 'Invited to workspace',
          message: `You have been invited to ${workspace.name}`,
          relatedId: workspace._id,
          model: 'Workspace'
        });
      });
    }

    const populated = await Workspace.findById(workspace._id).populate('owner members', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Get single workspace
// @route GET /api/workspaces/:id
exports.getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id).populate('owner members projects', 'name email');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (workspace.owner._id.toString() !== req.user._id.toString() && !workspace.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
};

// @desc Update workspace
// @route PUT /api/workspaces/:id
exports.updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner members', 'name email');
    
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    res.json({ success: true, data: workspace });
  } catch (error) {
    next(error);
  }
};

// @desc Delete workspace
// @route DELETE /api/workspaces/:id
exports.deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findByIdAndDelete(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

