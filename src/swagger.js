const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Telehealth API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Telehealth system'
        },
        servers: [
            {
                url: 'http://localhost:8000/api/v1',
                description: 'Local server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/apis/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = app => {
    app.use(
        '/api/v1/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec)
    );
};

module.exports = setupSwagger;
