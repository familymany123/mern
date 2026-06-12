const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Food = require("../app/models/food.model");
require("dotenv").config();
const getMongoDbUri = require("../app/config/mongodbUri");

const dbURI = getMongoDbUri();
const uploadsDir = path.join(__dirname, "..", "uploads");

async function main() {
  await mongoose.connect(dbURI);
  const foods = await Food.find({ image: { $ne: "" } }).select("name slug image").lean();
  await mongoose.disconnect();

  const files = foods
    .map((food) => {
      const filename = path.basename(food.image || "");
      const filePath = path.join(uploadsDir, filename);

      return {
        name: food.name,
        slug: food.slug,
        filename,
        filePath,
        generated: filename.startsWith("generated-"),
        exists: fs.existsSync(filePath),
      };
    })
    .filter((item) => item.exists && !item.generated);

  console.log(JSON.stringify(files, null, 2));
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
