const mongoose = require("mongoose");
const Category = require("../app/models/category.model");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/swiggi";
const baseApi = process.env.BASE_API || "http://127.0.0.1:3001";

const slugs = [
  "combo-an-nhanh",
  "ga-ran",
  "mi-y",
  "burger",
  "mon-phu",
  "thuc-uong",
];

async function main() {
  await mongoose.connect(dbURI);

  for (const slug of slugs) {
    const image = `${baseApi}/uploads/generated-category-${slug}.png`;
    const result = await Category.updateOne(
      { slug },
      { $set: { image, updated_at: new Date() } }
    );
    console.log(`${slug}: ${result.modifiedCount}`);
  }

  const categories = await Category.find().sort({ created_at: 1 }).lean();
  console.log(
    JSON.stringify(
      categories.map((category) => ({
        name: category.name,
        slug: category.slug,
        image: category.image,
      })),
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
