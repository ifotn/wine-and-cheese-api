import express from 'express';
import bodyParser from 'body-parser';

// controllers
import cheesesController from './controllers/cheeses.js';

// create express server object
const app = express();

app.use(bodyParser.json());

// url dispatching
app.use('/api/v1/cheeses', cheesesController);

// start web server
app.listen(3000, () => {
    console.log('Express API running on port 3000');
});