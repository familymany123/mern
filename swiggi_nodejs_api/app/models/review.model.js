const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'foods', required: true },
    star: { type: Number, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
