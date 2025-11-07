const app = require('./app');

const main = async () => {
    const server = app.listen(3000, () => {
        console.log('Server started on port http://localhost:3000/api/project/university');
    });
};

main();