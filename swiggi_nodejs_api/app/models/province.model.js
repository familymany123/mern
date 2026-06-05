const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const Province = mongoose.model('provinces', provinceSchema);

module.exports = Province;
