const express = require('express');
const router = express.Router();
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport'); // require passport
const { storeReturnTo } = require('../utils/middleware');

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
            // login the user after registration
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash('success', 'Welcome to Camp Oasis!');
                const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
                delete req.session.returnTo;
                res.redirect(redirectUrl);
            });
        } catch (err) {
            if (err.code === 11000 || err.message.includes('E11000')) {
                // This is a duplicate key error
                req.flash('error', 'A user with that email is already registered');
            } else {
                // This is some other error
                req.flash('error', err.message);
            }
            res.redirect('register');
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
    storeReturnTo, // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    (req, res) => {
        req.flash('success', 'Welcome back!');
        const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
        delete req.session.returnTo;
        res.redirect(redirectUrl);
    }
);

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});

module.exports = router;
