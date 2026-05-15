const express = require('express');
const { protect } = require('../middleware/auth');
const { getWorkspaces, createWorkspace, getWorkspace, updateWorkspace, deleteWorkspace } = require('../controllers/workspaceController');
const { workspaceOwner } = require('../middleware/authorization');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkspaces)
  .post(createWorkspace);

router.route('/:id')
  .get(getWorkspace)
  .put(workspaceOwner, updateWorkspace)
  .delete(workspaceOwner, deleteWorkspace);

// Nested project routes
router.use('/:workspaceId/projects', require('./projects'));

module.exports = router;
