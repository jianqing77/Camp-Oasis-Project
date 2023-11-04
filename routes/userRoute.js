const express = require('express');
const router = express.Router();
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport'); // require passport

router.get('/register', (req, res) => {
    res.render('users/register');
});

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
            // define a specific error handler for the error
            req.flash('error', e.message);
            res.redirect('register');
        }
    })
);

module.exports = router;
