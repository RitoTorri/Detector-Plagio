// Imports
import express from 'express';
const router = express.Router();
import controllerCalculate from '../controllers/calculate.plagiarism.controller.js';

// Routes
router.post('/calculate/plagiarism', controllerCalculate.calculatePlagiarism);

export default router;