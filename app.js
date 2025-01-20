import express from 'express';

// controllers
import cheesesController from './controllers/cheeses.js';

// create express server object
const app = express();

// url dispatching
app.use('/cheeses', cheesesController);

// start web server
app.listen(3000, () => {
    console.log('Express API running on port 3000');
});