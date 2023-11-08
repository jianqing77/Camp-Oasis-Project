// require Campground model
const Campground = require('../models/Campground');

module.exports.index = async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { allCampgrounds });
};

module.exports.renderNewForm = async (req, res) => {
    res.render('campgrounds/addNew');
};

module.exports.createNewCampground = async (req, res, next) => {
    if (!req.body.campground) {
        throw new ExpressError('Invalid Campground Data', 400);
    }
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();

    req.flash('success', 'Successfully added a new campground');
    res.redirect(`/campgrounds/${newCampground._id}`);
};

module.exports.showCampground = async (req, res) => {
    const tarCampground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author',
            },
        })
        .populate('author');
    if (!tarCampground) {
        req.flash('error', 'No matching campground found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/detail', { tarCampground });
};

module.exports.renderUpdateForm = async (req, res) => {
    const tarCampground = await Campground.findById(req.params.id);
    if (!tarCampground) {
        req.flash('error', 'No matching campground found!');
        return res.redirect('/campgrounds');
    }
    req.flash('success', 'Successfully updated a campground');
    res.render('campgrounds/edit', { tarCampground });
};

module.exports.updateCampground = async (req, res) => {
    const tarId = req.params.id;
    const updatedCampground = await Campground.findByIdAndUpdate(tarId, {
        ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const tarId = req.params.id;
    await Campground.findByIdAndDelete(tarId);
    req.flash('success', 'Successfully deleted the campground');
    res.redirect('/campgrounds');
};
