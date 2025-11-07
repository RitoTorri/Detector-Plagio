// Este archivo contiene las rutas de las vistas

// Imports
const express = require('express');
const router = express.Router();
const path = require('path');

// Routes
router.get('/send/views', function (req, res) {
    res.sendFile(path.join(__dirname, '../../public/views/views.main.html'));
});

module.exports = router;