const mongoose = require("mongoose");
const Food = require("../app/models/food.model");

const dbURI = "mongodb://localhost:27017/swiggi";
const baseApi = process.env.BASE_API || "http://127.0.0.1:3001";

const slugs = [
  "ga-rut-xuong-gion",
  "ga-rut-xuong-sot-cay",
  "com-ga-sot-cay",
  "com-ga-rut-xuong",
  "burger-ga-gion",
  "burger-bo-pho-mai",
  "mi-y-bo-bam",
  "combo-burger-ga",
  "combo-gia-dinh-6-mieng-ga",
  "salad-bap-cai",
  "pho-mai-que",
  "coca-cola",
  "tra-dao",
  "tra-chanh",
];

async function main() {
  await mongoose.connect(dbURI);

  for (const slug of slugs) {
    const image = `${baseApi}/uploads/generated-${slug}.png`;
    const result = await Food.updateOne(
      { slug },
      { $set: { image, updated_at: new Date() } }
    );

    console.log(`${slug}: ${result.modifiedCount}`);
  }

  const missing = await Food.find({
    $or: [{ image: { $exists: false } }, { image: "" }, { image: null }],
  })
    .select("name slug")
    .lean();

  console.log(`Missing image count: ${missing.length}`);
  if (missing.length > 0) {
    console.log(JSON.stringify(missing, null, 2));
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
