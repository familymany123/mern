const mongoose = require("mongoose");
const Food = require("../app/models/food.model");
const Category = require("../app/models/category.model");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/swiggi";

async function main() {
  await mongoose.connect(dbURI);

  const categories = await Category.find();
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const moves = [
    ["combo", "combo-an-nhanh"],
    ["do-uong", "thuc-uong"],
    ["com", "ga-ran"],
  ];

  for (const [fromSlug, toSlug] of moves) {
    const from = bySlug.get(fromSlug);
    const to = bySlug.get(toSlug);

    if (!from || !to) {
      console.log(`Skipped ${fromSlug} -> ${toSlug}: missing category`);
      continue;
    }

    const result = await Food.updateMany(
      { category: from._id },
      { $set: { category: to._id, updated_at: new Date() } }
    );

    console.log(`Moved ${result.modifiedCount} foods: ${from.name} -> ${to.name}`);
  }

  const duplicateIds = ["com", "combo", "do-uong"]
    .map((slug) => bySlug.get(slug)?._id)
    .filter(Boolean);

  const deleteResult = await Category.deleteMany({ _id: { $in: duplicateIds } });
  console.log(`Deleted ${deleteResult.deletedCount} duplicate categories`);

  const grouped = await Food.aggregate([
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: "$category" },
    { $group: { _id: "$category.name", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log(JSON.stringify(grouped, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
