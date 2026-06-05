const mongoose = require('mongoose');

const toppingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Topping = mongoose.model('toppings', toppingSchema);

module.exports = Topping;
