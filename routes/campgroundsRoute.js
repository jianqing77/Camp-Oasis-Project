const express = require('express');
const router = express.Router();

// require Campground model
const Campground = require('../models/Campground');

// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

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
    catchAsync(async (req, res) => {
        res.render('campgrounds/addNew');
    })
);

// use the req.body from the addNew.ejs
router.post(
    '/',
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
router.get(
    '/:id',
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id).populate(
            'reviews'
        );
        res.render('campgrounds/detail', { tarCampground });
    })
);

// ------------------ Update Single Campground ------------------
// render the form page to edit the campground
router.get(
    '/:id/edit',
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id);
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
        res.redirect('/campgrounds');
    })
);

module.exports = router;
