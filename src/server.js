const config = require('./config');
const app = require('./app');

process.on('uncaughtException', err => {
    console.error(err);
    process.exit(1);
});

let server;

async function startServer() {
    server = app.listen(config.port, () => {
        console.log(`🎯 Server listening on port: ${config.port}`);
    });

    process.on('unhandledRejection', error => {
        if (server) {
            server.close(() => {
                console.log(error);
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    });
}

startServer();

process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (server) {
        server.close();
    }
});
