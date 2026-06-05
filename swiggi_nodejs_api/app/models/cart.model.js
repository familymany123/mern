const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'foods', required: true },
    toppings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'toppings' }],
    quantity: { type: Number, required: true, min: 1 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Cart = mongoose.model('carts', cartSchema);

module.exports = Cart;
