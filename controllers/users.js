const User = require('../models/User');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res) => {
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
};

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; // update this line to use res.locals.returnTo now
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
};
