const Project = require('../models/Project');
const Workspace = require('../models/Workspace');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// @desc Get projects in workspace
// @route GET /api/workspaces/:workspaceId/projects
exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ workspace: req.params.workspaceId }).populate('owner members', 'name email');
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};

// @desc Create project
// @route POST /api/workspaces/:workspaceId/projects
exports.createProject = async (req, res, next) => {
  try {
    const project = new Project({
      ...req.body,
      workspace: req.params.workspaceId,
      owner: req.user._id
    });
    await project.save();

    // Update workspace
    await Workspace.findByIdAndUpdate(req.params.workspaceId, { $push: { projects: project._id } });

    // Notify members
    if (req.body.members && req.body.members.length > 0) {
      req.body.members.forEach(async (memberId) => {
        await Notification.create({
          user: memberId,
          type: 'member_added',
          title: 'Added to project',
          message: `Added to project ${project.name}`,
          relatedId: project._id,
          model: 'Project'
        });
      });
    }

    const populated = await Project.findById(project._id).populate('owner members workspace', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc Get project
// @route GET /api/workspaces/:workspaceId/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner members workspace tasks', 'name email title');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc Update project (incl. progress calculation)
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner members workspace', 'name');
    
    // Recalculate progress based on tasks
    const tasks = await Task.find({ project: project._id });
    const completed = tasks.filter(t => t.status === 'done').length;
    project.progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    await project.save();

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// @desc Delete project
exports.deleteProject = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

