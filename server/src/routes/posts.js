const express = require('express');
const PostController = require('../controllers/PostController');

const router = express.Router(); // Importação do router do express.

router.post('/', PostController.create);

module.exports = router;