import express from 'express';
import passport from 'passport';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import sgMail from '@sendgrid/mail';
import TempSession from '../models/tempSession.js';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// create express router
const router = express.Router();

// SendGrid email test method
const sendMail = () => {
    // create message w/4 basic email properties
    const msg = {
        to: 'rfreema1@lakeheadu.ca', 
        from: process.env.MAIL_FROM,
        subject: 'Testing SendGrid Email from our API',
        html: '<h1>Test Email</h1><p>This is a test message.</p>'
    };

    // try sending the message via SendGrid
    sgMail.send(msg)
    .then(() => {
        console.log('Email sent')
    })
    .catch((error) => {
        console.log(error);
    })
};

router.get('/send-email', (req, res) => {
    try {
        sendMail();
        return res.status(200).json({ msg: 'Email Sent' });
    }
    catch (err) {
        res.status(400).json(err);
    }
});

// send 2FA verification code using SendGrid
const sendVerificationCode = async (username, verificationCode) => {
    // set up message
    const msg = {
        from: process.env.MAIL_FROM,
        to: username,
        subject: 'Your Wine and Cheese Verfication Code',
        html: `<h1>Your Verification Code</h1><h3>${verificationCode}</h3><p>This is valid for 10 minutes.</p>`
    };

    // send message
    sgMail.send(msg)
    .then(() => {
        console.log('Verification Code Sent');
    })
    .catch((error) => {
        console.log(error);
    });
};

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
            // disabling JWT & replacing w/2FA => jwt moved AFTER 2FA verification
            // // create jwt with user info
            // const authToken = generateToken(user);

            // // set httponly cookie containing new jwt
            // setTokenCookie(res, authToken);

            //console.log(`authToken: ${authToken}`);
            
            // 2FA start: generate code & email to user to be verified
            const verificationCode = Math.floor(100000 + Math.random() * 90000).toString();

            // save temp Code to db for 10 minutes
            const tempSession = new TempSession({
                username: req.body.username,
                verificationCode: verificationCode
            });
            await tempSession.save();
            await sendVerificationCode(req.body.username, verificationCode);

            return res.status(200).json({ "username": req.body.username });
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