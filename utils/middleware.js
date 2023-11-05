module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

// validate campground form data middleware
const { campgroundSchema } = require('../schemas/campgroundSchema');
module.exports.validateCampgroundForm = (req, res, next) => {
    const validationResult = campgroundSchema.validate(req.body);
    if (validationResult.error) {
        const msg = validationResult.error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// validate review form data middleware
const { reviewSchema } = require('../schemas/reviewSchema');
module.exports.validateReviewForm = (req, res, next) => {
    const validationResult = reviewSchema.validate(req.body);
    if (validationResult.error) {
        const msg = validationResult.error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const Campground = require('../models/Campground');
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

const Review = require('../models/Review');
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (review.author && !review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};
