const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    show: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Banner = mongoose.model('banners', bannerSchema);

module.exports = Banner;
