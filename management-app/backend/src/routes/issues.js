const express = require('express');
const { protect } = require('../middleware/auth');
const { getIssues, createIssue, updateIssue, deleteIssue } = require('../controllers/issueController');

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route('/')
  .get(getIssues)
  .post(createIssue);

router.route('/:issueId')
  .put(updateIssue)
  .delete(updateIssue);

module.exports = router;

