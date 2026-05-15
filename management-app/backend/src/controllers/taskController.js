const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to emit to workspace room
const emitToWorkspace = (req, event, data) => {
  const io = req.app.get('io');
  const workspaceId = req.params.workspaceId;
  io.to(`workspace_${workspaceId}`).emit(event, data);
};

// @desc Get tasks for project
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignee', 'name email')
      .sort('position');
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    next(error);
  }
};

// @desc Create task
exports.createTask = async (req, res, next) => {
  try {
    const task = new Task({
      ...req.body,
      project: req.params.projectId
    });
    await task.save();

    const populatedTask = await Task.findById(task._id).populate('assignee project', 'name title');
    emitToWorkspace(req, 'taskCreated', populatedTask);
    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc Update task (status, position for drag-drop)
exports.updateTask = async (req, res, next) => {
  try {
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      updates,
      { new: true, runValidators: true }
    ).populate('assignee project', 'name title');

    emitToWorkspace(req, 'taskUpdated', task);

    if (updates.assignee || updates.status) {
      const assignee = await User.findById(updates.assignee);
      if (assignee) {
        await Notification.create({
          user: updates.assignee,
          type: updates.status ? 'task_updated' : 'task_assigned',
          title: `Task ${task.title} updated`,
          message: `Status: ${task.status}${updates.assignee ? ', Assignee: ' + assignee.name : ''}`,
          relatedId: task._id,
          model: 'Task'
        });
      }
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc Delete task
exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.taskId);
    emitToWorkspace(req, 'taskDeleted', { id: req.params.taskId });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

