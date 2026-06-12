const mongoose = require("mongoose");

const recommendationItemSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: "foods", required: true },
    score: { type: Number, required: true, default: 0 },
    boughtTogether: { type: Number, required: true, default: 0 },
    confidence: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const recommendationSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "foods",
    required: true,
    unique: true,
  },
  recommendations: [recommendationItemSchema],
  sourceOrderCount: { type: Number, required: true, default: 0 },
  updated_at: { type: Date, default: Date.now },
});

const Recommendation = mongoose.model("recommendations", recommendationSchema);

module.exports = Recommendation;
