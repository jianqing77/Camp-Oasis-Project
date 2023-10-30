// step 1: set up the app framework: using express
const express = require('express');
const app = express();

// step 2: set up the view engine: ejs
const ejsMate = require('ejs-mate');
const path = require('path');
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =================================================================
// ================== Database Connection ==========================
// =================================================================
// step 3: set up database connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/camp-oasis', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

// 3.1 require model
const Campground = require('./models/Campground');

// =================================================================
// ======================= Middlewares =============================
// =================================================================
// tell express to parse the request body
app.use(express.urlencoded({ extended: true }));
// BEFORE DEFINE POST & DELETE: require method override to handle the put/delete actions
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// =================================================================
// ======================= Route Handlers ==========================
// =================================================================

// ------------------ Retrieve All Campgrounds  ------------------
// render the page to show all the campground
app.get('/campgrounds', async (req, res) => {
    const allCampgrounds = await Campground.find({});
    res.render('campgrounds/index', { allCampgrounds });
});

// ------------------ Add New Campground --------------------
// render form page to add new campground
app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/addNew');
});

// use the req.body from the addNew.ejs
app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
});

// ------------------ Retrieve Single Campground ------------------
// direct to the page to show the campground details
app.get('/campgrounds/:id', async (req, res) => {
    const tarCampground = await Campground.findById(req.params.id);
    res.render('campgrounds/detail', { tarCampground });
});

// ------------------ Update Single Campground ------------------
// render the form page to edit the campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const tarCampground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { tarCampground });
});

// define the route to change the campground info with req.body from the edit.ejs
app.put('/campgrounds/:id', async (req, res) => {
    const tarId = req.params.id;
    const updatedCampground = await Campground.findByIdAndUpdate(tarId, {
        ...req.body.campground,
    });
    res.redirect(`/campgrounds/${updatedCampground._id}`);
});

// ------------------ Delete Single Campground ------------------
app.delete('/campgrounds/:id', async (req, res) => {
    const tarId = req.params.id;
    await Campground.findByIdAndDelete(tarId);
    res.redirect('/campgrounds');
});

//
app.listen(3000, () => {
    console.log('Serving on port 3000');
});
