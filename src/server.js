import app from './app.js';
import translante from './utils/translante.js';

const main = async () => {
    app.listen(3000, async () => {
        console.log('Server started: http://localhost:3000/api/project/university/send/views\n');
        console.log('Server started production: https://proyecto-detector-de-plagio.onrender.com/api/project/university/send/views');
    });
};

setInterval(async () => {
    console.log('⏰ Iniciando nueva traducción de libros');
    await translante();
}, 5000);


main();