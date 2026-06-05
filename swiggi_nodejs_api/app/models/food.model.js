const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    image: String,
    slug: { type: String, required: true },
    cooking_time: String,
    show: { type: Boolean, default: true },
    type: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
  });
  
  const Food = mongoose.model('foods', foodSchema);

  module.exports = Food;
  