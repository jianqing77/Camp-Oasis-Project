const express = require('express');
const router = express.Router({ mergeParams: true });

// require models
const Campground = require('../models/Campground');
const Review = require('../models/Review');

// error handling: import the async wrapper defined in utils
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// =================================================================
// ======================= Middlewares =============================
// =================================================================
const { reviewSchema } = require('../schemas/reviewSchema');

const validateReviewForm = (req, res, next) => {
    const validationResult = reviewSchema.validate(req.body);
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
// ------------------ Add New Review ------------------
router.post(
    '/',
    validateReviewForm,
    catchAsync(async (req, res) => {
        const tarCampground = await Campground.findById(req.params.id);
        const newReview = new Review(req.body.review);
        tarCampground.reviews.push(newReview);
        await newReview.save();
        await tarCampground.save();
        req.flash('success', 'Successfully added a review');
        res.redirect(`/campgrounds/${tarCampground._id}`);
    })
);

// ------------------ Delete a Review ------------------
router.delete(
    '/:reviewId',
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash('success', 'Review deleted successfully');
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
