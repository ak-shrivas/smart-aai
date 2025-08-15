const express = require('express');
const router = express.Router();
const { trackProduct, fetchProductInfo} = require('../controllers/trackController');
const { fetchAiTips} = require('../controllers/aiController');

router.post('/', trackProduct);

router.post('/fetch-info', fetchProductInfo);

router.post('/ai-tips', fetchAiTips);


module.exports = router;
