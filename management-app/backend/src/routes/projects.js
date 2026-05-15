const express = require('express');
const { protect } = require('../middleware/auth');
const { getProjects, createProject, getProject, updateProject, deleteProject } = require('../controllers/projectController');
const { workspaceOwner } = require('../middleware/authorization');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(workspaceOwner, createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(workspaceOwner, deleteProject);  // Owner only

// Nested task routes
router.use('/:projectId/tasks', require('./tasks'));

// Nested issue routes
router.use('/:projectId/issues', require('./issues'));

module.exports = router;
