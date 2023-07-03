const app = require('./startup/express');

require('./startup/database');
require('./startup/routes')(app);

connection(app);

function connection(app) {
    const port = process.env.PORT || 3000;
    const server = app.listen(port, console.log(`Listening on port ${port}...`));
    return server;
}