import express from 'express';
import passport from 'passport';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

// create express router
const router = express.Router();

// JWT creation on successful login
const generateToken = (user) => {
    // set up jwt payload containing user info
    const payload = {
        id: user._id,
        username: user.username
    };

    // create token
    const jwtOptions = { 
        expiresIn: '1hr'
    };

    return jwt.sign(payload, process.env.PASSPORT_SECRET, jwtOptions);
};

// store JWT in HttpOnly cookie to be returned to client app and passed to all secure API requests
const setTokenCookie = (res, token) => {
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });
};

// expire cookie holding JWT 
const clearTokenCookie = (res) => {
    res.cookie('authToken', '', {
        httpOnly: true,
        expires: new Date(0)
    });
};

router.post('/register', async (req, res) => {
    // use passport-local-mongoose inherited methods in user model to try creating new user
    // create user first, then add pw second so it gets salted & hashed
    try {
        // duplicate username check
        let user = await User.findOne({ username: req.body.username });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        user = new User({ username: req.body.username });
        await user.setPassword(req.body.password);
        await user.save();
        return res.status(201).json({ msg: 'User registered successfully' });
    }
    catch (err) {
        return res.status(400).json(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const { user } = await User.authenticate()(req.body.username, req.body.password);
        if (user) {
            // create jwt with user info
            const authToken = generateToken(user);

            // set httponly cookie containing new jwt
            setTokenCookie(res, authToken);

            //console.log(`authToken: ${authToken}`);
            return res.status(200).json(req.body.username);
        }
        else {
            return res.status(401).json({ msg: 'Invalid Login' });
        }
    }
    catch (err) {
        return res.status(400).json(err);
    }
});

router.get('/logout', (req, res) => {
    try {
        // expire http only cookie holding jwt
        clearTokenCookie(res);
        return res.status(200).json({ msg: 'User logged out' });
    }
    catch (err) {
        return res.status(400).json(err);
    }
});

// make public
export default router;