const express = require('express');
const router = express.Router();

// import the campground controller
const campgroundController = require('../controllers/campground');

// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampgroundForm } = require('../utils/middleware');

// ======================= Route Handlers ==========================
// ------------------ Retrieve All Campgrounds  ------------------
// ------------------ Add New Campground --------------------

router
    .route('/')
    .get(catchAsync(campgroundController.index))
    .post(
        isLoggedIn,
        validateCampgroundForm,
        catchAsync(campgroundController.createNewCampground)
    );

// ------------------ Add New Campground --------------------
// render form to add new campground
router.get('/new', isLoggedIn, catchAsync(campgroundController.renderNewForm));

// ------------------ Retrieve Single Campground ------------------
// ------------------ Update Single Campground ------------------

// direct to the page to show the campground details
router
    .route('/:id')
    .get(catchAsync(campgroundController.showCampground))
    .post(
        isLoggedIn,
        isAuthor,
        validateCampgroundForm,
        catchAsync(campgroundController.updateCampground)
    )
    .delete(isLoggedIn, isAuthor, catchAsync(campgroundController.deleteCampground));

// render the form to update the campground
router.get(
    '/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(campgroundController.renderUpdateForm)
);

module.exports = router;
