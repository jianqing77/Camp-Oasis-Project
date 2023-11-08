const Campground = require('../models/Campground');
const Review = require('../models/Review');

// ------------------ Add New Review ------------------
module.exports.createReview = async (req, res) => {
    const tarCampground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    tarCampground.reviews.push(review);
    await review.save();
    await tarCampground.save();
    req.flash('success', 'Successfully added a review');
    res.redirect(`/campgrounds/${tarCampground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully');
    res.redirect(`/campgrounds/${id}`);
};
