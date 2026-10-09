const express = require('express');
const scanController = require('../controllers/scanController');
const validateBody = require('../middleware/validateBody');
const { scanRequestSchema } = require('../schemas/scanSchemas');

const router = express.Router();

router.post('/', validateBody(scanRequestSchema), scanController.scan);

module.exports = router;
