const express = require('express');
const { protect } = require('../middleware/auth');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(markAllAsRead);

router.route('/:id/read')
  .put(markAsRead);

module.exports = router;

