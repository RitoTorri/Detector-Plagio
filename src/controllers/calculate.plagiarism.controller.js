const responses = require('../utils/responses');
const serviceCalculate = require('../services/calculate.plagiarism.service');

class CalculatePlagiarismController {
    constructor() { }

    async calculatePlagiarism(req, res) {
        try {
            serviceCalculate.calculatePlagiarism();
        } catch (error) {
        }
    }
}

module.exports = new CalculatePlagiarismController();