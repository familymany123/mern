const mongoose = require('mongoose');

const foodToppingSchema = new mongoose.Schema({
    food: { type: mongoose.Schema.Types.ObjectId, ref: 'foods', required: true },
    topping: { type: mongoose.Schema.Types.ObjectId, ref: 'toppings', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

foodToppingSchema.index({ food: 1, topping: 1 }, { unique: true });

const FoodTopping = mongoose.model('foods_toppings', foodToppingSchema);

module.exports = FoodTopping;
  
