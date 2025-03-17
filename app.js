import express from 'express';
import bodyParser from 'body-parser';
// swagger for api docs
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import mongoose from 'mongoose';

import cors from 'cors'
import path from 'path';

// passport auth
import passport from 'passport';
import User from './models/user.js';

// jwt auth
import cookieParser from 'cookie-parser';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

// controllers
import cheesesController from './controllers/cheeses.js';
import usersController from './controllers/users.js';

// create express server object
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

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

// passport auth config
app.use(passport.initialize());

// passport-local is the default
passport.use(User.createStrategy());

// jwt config
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.PASSPORT_SECRET
};

// jwt strategy
let strategy = new JwtStrategy(jwtOptions, async (jwt_payload, callback) => {
    try {
        const user = await User.findById(jwt_payload.id);
        if (user) {
            // user exists, send back no error plus the user object
            return callback(null, user);
        }
        // user not found
        return callback(null, false);
    }
    catch (err) {
        return callback(err, false);
    }
});

passport.use(strategy);

// url dispatching
app.use('/api/v1/cheeses', cheesesController);
app.use('/api/v1/users', usersController);
app.use('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

// start web server
app.listen(3000, () => {
    console.log('Express API running on port 3000');
});