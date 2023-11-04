const express = require('express');
const router = express.Router();

// require Campground model
const Campground = require('../models/Campground');

// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../utils/middleware');

// =================================================================
// ======================= Middlewares =============================
// =================================================================
// validate campground form data middleware
const { campgroundSchema } = require('../schemas/campgroundSchema');
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
router.get(
    '/',
    catchAsync(async (req, res) => {
        const allCampgrounds = await Campground.find({});
        res.render('campgrounds/index', { allCampgrounds });
    })
);

// ------------------ Add New Campground --------------------
// render form page to add new campground
router.get(
    '/new',
    isLoggedIn,
    catchAsync(async (req, res) => {
        res.render('campgrounds/addNew');
    })
);

// use the req.body from the addNew.ejs
router.post(
    '/',
    isLoggedIn,
    validateCampgroundForm,
    catchAsync(async (req, res, next) => {
        if (!req.body.campground) {
            throw new ExpressError('Invalid Campground Data', 400);
        }
        const newCampground = new Campground(req.body.campground);
        await newCampground.save();
        req.flash('success', 'Successfully added a new campground');
        res.redirect(`/campgrounds/${newCampground._id}`);
    })
);

// ------------------ Retrieve Single Campground ------------------
// direct to the page to show the campground details
router.get(
    '/:id',
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id).populate(
            'reviews'
        );
        if (!tarCampground) {
            req.flash('error', 'No matching campground found!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/detail', { tarCampground });
    })
);

// ------------------ Update Single Campground ------------------
// render the form page to edit the campground
router.get(
    '/:id/edit',
    isLoggedIn,
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id);
        if (!tarCampground) {
            req.flash('error', 'No matching campground found!');
            return res.redirect('/campgrounds');
        }
        req.flash('success', 'Successfully updated a campground');
        res.render('campgrounds/edit', { tarCampground });
    })
);

// define the route to change the campground info with req.body from the edit.ejs
router.put(
    '/:id',
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
router.delete(
    '/:id',
    catchAsync(async (req, res) => {
        const tarId = req.params.id;
        await Campground.findByIdAndDelete(tarId);
        req.flash('success', 'Successfully deleted the campground');
        res.redirect('/campgrounds');
    })
);

module.exports = router;
