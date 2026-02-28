const express = require('express');
const { getAllPosts } = require('../controllers/postsController');
const router = express.Router();

router.get('/', getAllPosts);

module.exports = router;
