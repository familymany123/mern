const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  title: { type: String, required: true },
  address: { type: String, required: true },
  logo: { type: String, required: true },
  favicon: { type: String, required: true },
  facebook: { type: String, required: true },
  youtube: { type: String, required: true },
  x: { type: String, required: true },  // Replace 'x' with a more descriptive field name if possible
  instagram: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Config = mongoose.model('configs', configSchema);

module.exports = Config;
