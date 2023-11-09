// connect to mongoose
const mongoose = require('mongoose');
const Campground = require('../models/Campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/camp-oasis', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

// pick a random number from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({}); // delete everything
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            author: '65460b573b58f84f3d4d3926',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'This is the description',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dtn3qnvjf/image/upload/v1699516524/Camp-Oasis/j4vemf69ekijvsokqk2s.jpg',
                    fileName: 'Camp-Oasis/j4vemf69ekijvsokqk2s',
                },
                {
                    url: 'https://res.cloudinary.com/dtn3qnvjf/image/upload/v1699516526/Camp-Oasis/k4kbqvoydgxihoikcipa.jpg',
                    fileName: 'Camp-Oasis/k4kbqvoydgxihoikcipa',
                },
            ],
        });
        await camp.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
