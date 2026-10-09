const express = require('express');
const redactController = require('../controllers/redactController');
const validateBody = require('../middleware/validateBody');
const { redactRequestSchema } = require('../schemas/scanSchemas');

const router = express.Router();

router.post('/', validateBody(redactRequestSchema), redactController.redact);

module.exports = router;
