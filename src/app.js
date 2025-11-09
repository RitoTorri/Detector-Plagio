// Imports
import express from 'express';
const app = express();
import morgan from 'morgan';
import routerCalculatePlagiarism from './routes/calculate.plagiarism.route.js';
import routerSendViews from './routes/send.views.route.js';

// paths
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DEBUG - Verificar rutas
const publicPath = path.join(__dirname, '../public');

// Configuración CORRECTA de archivos estáticos
app.use('/public', express.static(publicPath));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
const ApiBaseUrl = '/api/project/university';
app.use(ApiBaseUrl, routerCalculatePlagiarism);
app.use(ApiBaseUrl, routerSendViews);

export default app;