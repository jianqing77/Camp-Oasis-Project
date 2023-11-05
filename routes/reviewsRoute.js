const express = require('express');
const router = express.Router({ mergeParams: true });

// require models
const Campground = require('../models/Campground');
const Review = require('../models/Review');

// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

const { isLoggedIn, validateReviewForm, isReviewAuthor } = require('../utils/middleware');
// =================================================================
// ======================= Middlewares =============================
// =================================================================

// =================================================================
// ======================= Route Handlers ==========================
// =================================================================
// ------------------ Add New Review ------------------
router.post(
    '/',
    isLoggedIn,
    validateReviewForm,
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
        tarCampground.reviews.push(review);
        await review.save();
        await tarCampground.save();
        req.flash('success', 'Successfully added a review');
        res.redirect(`/campgrounds/${tarCampground._id}`);
    })
);

// ------------------ Delete a Review ------------------
router.delete(
    '/:reviewId',
    isReviewAuthor,
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash('success', 'Review deleted successfully');
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
