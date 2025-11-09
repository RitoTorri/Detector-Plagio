// Imports
import express from 'express';
const router = express.Router();

// impor de los paths
import path from 'path';
import { fileURLToPath } from 'url';

// Necesario para usar __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Routes
router.get('/send/views', function (req, res) {
    console.log(path.join(__dirname, '../../public/views/views.main.html'));
    res.sendFile(path.join(__dirname, '../../public/views/views.main.html'))
});
export default router;