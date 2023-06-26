const sequelize = require('./startup/database');
const app = require('./startup/express');

require('./startup/routes')(app);

const server = connection(app);

function connection(app) {
    const port = process.env.PORT || 3000;
    const server = app.listen(port, console.log(`Listening on port ${port}...`));
    return server;
}