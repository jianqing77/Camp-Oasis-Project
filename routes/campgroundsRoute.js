const express = require('express');
const router = express.Router();

// import the campground controller
const campgroundController = require('../controllers/campground');

// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampgroundForm } = require('../utils/middleware');

// ======================= Route Handlers ==========================
//
// ------------------ Retrieve All Campgrounds  ------------------
// render the page to show all the campground
router.get('/', catchAsync(campgroundController.index));

// ------------------ Add New Campground --------------------
// render form page to add new campground
router.get('/new', isLoggedIn, catchAsync(campgroundController.renderNewForm));

// use the req.body from the addNew.ejs
router.post(
    '/',
    isLoggedIn,
    validateCampgroundForm,
    catchAsync(campgroundController.createNewCampground)
);

// ------------------ Retrieve Single Campground ------------------
// direct to the page to show the campground details
router.get('/:id', catchAsync(campgroundController.campgroundDetail));

// ------------------ Update Single Campground ------------------
// render the form page to edit the campground
router.get(
    '/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.renderUpdateForm)
);

// define the route to change the campground info with req.body from the edit.ejs
router.put(
    '/:id',
    isLoggedIn,
    isAuthor,
    validateCampgroundForm,
    catchAsync(campgroundController.updateCampground)
);

// ------------------ Delete Single Campground ------------------
router.delete(
    '/:id',
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.deleteCampground)
);

module.exports = router;
