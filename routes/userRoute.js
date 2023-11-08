const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport'); // require passport
const { storeReturnTo } = require('../utils/middleware');

// refactor using router.route in express
router
    .route('/register')
    .get(userController.renderRegister) // route to registration form
    .post(catchAsync(userController.register)); // route to create a new user

router
    .route('/login')
    .get(userController.renderLogin) // route to the login form
    .post(
        storeReturnTo, // use the storeReturnTo middleware to save the returnTo value from session to res.locals
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        userController.login
    ); // route to actually login the user

router.get('/logout', userController.logout);

// router.get('/register', userController.renderRegister);
// router.post('/register', catchAsync(userController.register));
// router.get('/login', userController.renderLogin);
// route to actually login the user
// router.post(
//     '/login',
//     storeReturnTo, // use the storeReturnTo middleware to save the returnTo value from session to res.locals
//     passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
//     userController.login
// );

module.exports = router;
