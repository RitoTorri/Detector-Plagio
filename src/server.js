import app from './app.js';

const main = async () => {
    const server = app.listen(3000, () => {
        console.log('Server started: http://localhost:3000/api/project/university/send/views\n\n');
        console.log('Server started production: https://proyecto-detector-de-plagio.onrender.com/api/project/university/send/views');
    });
};

main();