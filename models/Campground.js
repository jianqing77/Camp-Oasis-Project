const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    location: String,
    images: [
        {
            url: String,
            fileName: String,
        },
    ],
    description: String,
    price: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review',
        },
    ],
});

module.exports = mongoose.model('Campground', CampgroundSchema);
