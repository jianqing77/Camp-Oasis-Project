// step 1: set up the app framework: using express
const express = require('express');
const app = express();

// step 2: set up the view engine: ejs
const ejsMate = require('ejs-mate');
const path = require('path');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// 3.1 require model
const Campground = require('./models/Campground');

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
const catchAsync = require('./utils/catchAsync');
// validate campground form data middleware
const { campgroundSchema } = require('./schemas/campgroundSchema');
const validateCampgroundForm = (req, res, next) => {
    const validationResult = campgroundSchema.validate(req.body);
    if (validationResult.error) {
        const msg = validationResult.error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// =================================================================
// ======================= Route Handlers ==========================
// =================================================================

// ------------------ Retrieve All Campgrounds  ------------------
// render the page to show all the campground
app.get(
    '/campgrounds',
    catchAsync(async (req, res) => {
        const allCampgrounds = await Campground.find({});
        res.render('campgrounds/index', { allCampgrounds });
    })
);

// ------------------ Add New Campground --------------------
// render form page to add new campground
app.get(
    '/campgrounds/new',
    catchAsync(async (req, res) => {
        res.render('campgrounds/addNew');
    })
);

// use the req.body from the addNew.ejs
app.post(
    '/campgrounds',
    validateCampgroundForm,
    catchAsync(async (req, res, next) => {
        if (!req.body.campground) {
            throw new ExpressError('Invalid Campground Data', 400);
        }
        const newCampground = new Campground(req.body.campground);
        await newCampground.save();
        res.redirect(`/campgrounds/${newCampground._id}`);
    })
);

// ------------------ Retrieve Single Campground ------------------
// direct to the page to show the campground details
app.get(
    '/campgrounds/:id',
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id);
        res.render('campgrounds/detail', { tarCampground });
    })
);

// ------------------ Update Single Campground ------------------
// render the form page to edit the campground
app.get(
    '/campgrounds/:id/edit',
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', { tarCampground });
    })
);

// define the route to change the campground info with req.body from the edit.ejs
app.put(
    '/campgrounds/:id',
    validateCampgroundForm,
    catchAsync(async (req, res) => {
        const tarId = req.params.id;
        const updatedCampground = await Campground.findByIdAndUpdate(tarId, {
            ...req.body.campground,
        });
        res.redirect(`/campgrounds/${updatedCampground._id}`);
    })
);

// ------------------ Delete Single Campground ------------------
app.delete(
    '/campgrounds/:id',
    catchAsync(async (req, res) => {
        const tarId = req.params.id;
        await Campground.findByIdAndDelete(tarId);
        res.redirect('/campgrounds');
    })
);
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
    const { statusCode } = err; // Destructure the status code from the error object
    if (!err.message) err.message = 'Oh no! Something went wrong.'; // If there is no message attached to the error, set a default error message
    // Set the status of the response & render an error template.
    res.status(statusCode).render('error', { err }); // also passing in the error object to the template, which can be used to display specific error details.
});

//
app.listen(3000, () => {
    console.log('Serving on port 3000');
});
