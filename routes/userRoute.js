const express = require('express');
const router = express.Router();

const User = require('../models/User');
const userController = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport'); // require passport
const { storeReturnTo } = require('../utils/middleware');

// route to registration form
router.get('/register', userController.renderRegister);

// route to create a new user
router.post('/register', catchAsync(userController.register));

// route to the login form
router.get('/login', userController.renderLogin);

// route to actually login the user
router.post(
    '/login',
    storeReturnTo, // use the storeReturnTo middleware to save the returnTo value from session to res.locals
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
    userController.login
);

router.get('/logout', userController.logout);

module.exports = router;
