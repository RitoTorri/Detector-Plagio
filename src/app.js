// Imports
const express = require('express');
const app = express();
const morgan = require('morgan');
const routerCalculatePlagiarism = require('./routes/calculate.plagiarism.route');
const routerSendViews = require('./routes/send.views.route');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

// Routes
const ApiBaseUrl = '/api/project/university';
app.use(ApiBaseUrl, routerCalculatePlagiarism);
app.use(ApiBaseUrl, routerSendViews);

module.exports = app;