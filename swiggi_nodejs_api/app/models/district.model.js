const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    province: { type: mongoose.Schema.Types.ObjectId, ref: 'provinces', required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

const District = mongoose.model('districts', districtSchema);

module.exports = District;