// Imports
const express = require('express');
const router = express.Router();
const controllerCalculate = require('../controllers/calculate.plagiarism.controller');

// Routes
router.get('/calculate/plagiarism', controllerCalculate.calculatePlagiarism);

module.exports = router;