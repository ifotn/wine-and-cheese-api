import express from 'express';
import bodyParser from 'body-parser';
// swagger for api docs
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';

import cors from 'cors'
import path from 'path';

// controllers
import cheesesController from './controllers/cheeses.js';

// create express server object
const app = express();

app.use(bodyParser.json());

// get public path for angular client app
const __dirname = path.resolve();
app.use(express.static(`${__dirname}/public`));

// swagger config
const docOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Cheese API',
            version: '1.0.0'
        }
    },
    apis: ['./controllers/*.js'] // where to find api methods (controllers)
};

const openapiSpecification = swaggerJSDoc(docOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

// db connect
mongoose.connect(process.env.DB, {})
.then((res) => console.log('Connected to MongoDB'))
.catch((err) => console.log(`Connection Failure: ${err}`));

// cors: allow angular client http access
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,POST,PUT,DELETE,HEAD,OPTIONS'
}));

// url dispatching
app.use('/api/v1/cheeses', cheesesController);
app.use('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

// start web server
app.listen(3000, () => {
    console.log('Express API running on port 3000');
});