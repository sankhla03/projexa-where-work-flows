const User = require('../models/User');

// Permit roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Workspace ownership check
const workspaceOwner = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspaceId || req.body.workspace;
    const workspace = await require('../models/Workspace').findById(workspaceId).populate('owner');
    if (!workspace || workspace.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not workspace owner' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authorize, workspaceOwner };

