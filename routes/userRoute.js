const express = require('express');
const router = express.Router();
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport'); // require passport

const handleRegisterErrors = (err, req, res) => {
    if (err.code === 11000 || err.message.includes('E11000')) {
        // This is a duplicate key error
        req.flash('error', 'A user with that email is already registered');
    } else {
        // This is some other error
        req.flash('error', err.message);
    }
    res.redirect('register');
};

// route to registration form
router.get('/register', (req, res) => {
    res.render('users/register');
});

// route to create a new user
router.post(
    '/register',
    catchAsync(async (req, res) => {
        try {
            const { username, password, email } = req.body;
            const newUser = new User({ email, username });
            console.log(newUser);
            const registeredUser = await User.register(newUser, password);
            req.flash('success', 'Welcome to Camp Oasis!');
            res.redirect('/campgrounds');
        } catch (e) {
            handleRegisterErrors(e);
        }
    })
);

// route to the login form
router.get('/login', (req, res) => {
    res.render('users/login');
});

// route to actually login the user
router.post(
    '/login',
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = req.session.returnTo || '/campgrounds';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

module.exports = router;
