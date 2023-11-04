// step 1: set up the app framework: using express
const express = require('express');
const app = express();

// step 2: set up the view engine: ejs
const ejsMate = require('ejs-mate');
const path = require('path');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// =================================================================
// ================== Database Connection ==========================
// =================================================================
// step 3: set up database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/camp-oasis', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

// ================ Session & Flash Configuration ===================

// Session Configuration
const session = require('express-session');
const sessionConfig = {
    secret: 'mySecretKey', // used to sign the session ID cookie
    resave: false, // forces the session to be saved back to the session store, even if the session was never modified during the request
    saveUninitialized: false, // forces a session that is "uninitialized" to be saved to the store
    cookie: { httpOnly: true }, // marks the cookie to be used with HTTPS only
};
app.use(session(sessionConfig));
// middleware to use the flash
const flash = require('connect-flash');
app.use(flash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ================ Passport Configuration ===================
const User = require('./models/User');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// set up Passport's persistent login sessions
app.use(passport.initialize()); // middleware to initialize Passport
app.use(passport.session()); // used after the Express session middleware and passport.initialize(), as it relies on them
passport.use(new LocalStrategy(User.authenticate())); // passport-local-mongoose provides to authenticate users
// handle sessions
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =================================================================
// ======================= Middlewares =============================
// =================================================================
// tell express to parse the request body
app.use(express.urlencoded({ extended: true }));
// BEFORE DEFINE POST & DELETE: require method override to handle the put/delete actions
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
// error handling: import the async wrapper defined in utils
const ExpressError = require('./utils/ExpressError');

// import the routes defined in the routes module
const campgroundsRoutes = require('./routes/campgroundsRoute');
const reviewsRoutes = require('./routes/reviewsRoute');
const userRoutes = require('./routes/userRoute');

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

// =================================================================
// ======================== Error Handler ==========================
// =================================================================
// Middleware to handle requests for routes not previously defined
app.all('*', (req, res, next) => {
    const UndefinedPageError = new ExpressError('Page not found', 404);
    next(UndefinedPageError); // Pass the error to the next middleware
});
// ------------------ Error Handler Middleware ------------------
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err; // Destructure the status code from the error object
    if (!err.message) err.message = 'Oh no! Something went wrong.'; // If there is no message attached to the error, set a default error message
    // Set the status of the response & render an error template.
    res.status(statusCode).render('error', { err }); // also passing in the error object to the template, which can be used to display specific error details.
});

//
app.listen(3000, () => {
    console.log('Serving on port 3000');
});
