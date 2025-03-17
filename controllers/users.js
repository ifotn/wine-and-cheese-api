import express from 'express';
import passport from 'passport';
import User from '../models/user.js';

// create express router
const router = express.Router();

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

// make public
export default router;