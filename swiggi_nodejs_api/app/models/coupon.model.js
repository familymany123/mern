const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    value: { type: Number, required: true },
    quantity: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Coupon = mongoose.model('coupons', couponSchema);

module.exports = Coupon;
