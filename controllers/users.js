import express from 'express';
import passport from 'passport';
import User from '../models/user.js';

// create express router
const router = express.Router();

router.post('/register', async (req, res) => {
    // use passport-local-mongoose inherited methods in user model to try creating new user
    // create user first, then add pw second so it gets salted & hashed
    try {
        const user = new User({ username: req.body.username });
        await user.setPassword(req.body.password);
        await user.save();
        return res.status(201).json(user);
    }
    catch (err) {
        return res.status(400).json(err);
    }
});

// make public
export default router;