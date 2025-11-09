import servicesCalculate from '../services/calculate.plagiarism.service.js';
import responses from '../utils/responses.js';

class CalculatePlagiarismController {
    constructor() { }

    async calculatePlagiarism(req, res) {
        try {
            const { textUser } = req.body;

            const result = await servicesCalculate.calculatePlagiarism(textUser);
            return responses.QuerySuccess(res, result);
        } catch (error) {
            return responses.QueryError(res, error.message);
        }
    }
}

export default new CalculatePlagiarismController();