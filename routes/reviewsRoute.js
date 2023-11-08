const express = require('express');
const router = express.Router({ mergeParams: true });

// import controllers
const reviewsController = require('../controllers/reviews');
// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// ======================= Middlewares =============================
const { isLoggedIn, validateReviewForm, isReviewAuthor } = require('../utils/middleware');

// ======================= Route Handlers ==========================
// Add New Review
router.post(
    '/',
    isLoggedIn,
    validateReviewForm,
    catchAsync(reviewsController.createReview)
);

// Delete a Review
router.delete('/:reviewId', isReviewAuthor, catchAsync(reviewsController.deleteReview));

module.exports = router;
