const mongoose = require("mongoose");
const Food = require("../app/models/food.model");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/swiggi";
const baseApi = process.env.BASE_API || "http://127.0.0.1:3001";

const imageBySlug = {
  "1-mieng-ga-gion": "generated-ga-rut-xuong-gion.png",
  "2-mieng-ga-gion": "generated-ga-rut-xuong-gion.png",
  "4-mieng-ga-gion": "generated-ga-rut-xuong-gion.png",
  "1-mieng-ga-sot-cay": "generated-ga-rut-xuong-sot-cay.png",
  "2-mieng-ga-sot-cay": "generated-ga-rut-xuong-sot-cay.png",
  "ga-rut-xuong-gion": "generated-ga-rut-xuong-gion.png",
  "ga-rut-xuong-sot-cay": "generated-ga-rut-xuong-sot-cay.png",
  "com-ga-gion": "generated-com-ga-rut-xuong.png",
  "com-ga-mam-toi": "generated-com-ga-rut-xuong.png",
  "com-ga-sot-cay": "generated-com-ga-sot-cay.png",
  "com-ga-rut-xuong": "generated-com-ga-rut-xuong.png",
  "com-trang": "generated-com-ga-rut-xuong.png",
  "burger-ga-gion": "generated-burger-ga-gion.png",
  "burger-tom": "generated-burger-ga-gion.png",
  "burger-bo-pho-mai": "generated-burger-bo-pho-mai.png",
  "combo-sandwich": "generated-combo-burger-ga.png",
  "mi-y-sot-cay": "generated-mi-y-bo-bam.png",
  "mi-y-bo-bam": "generated-mi-y-bo-bam.png",
  "mi-y-ga-rut-xuong": "generated-mi-y-bo-bam.png",
  "combo-mi-ga": "generated-combo-gia-dinh-6-mieng-ga.png",
  "combo-ga-gion-khoai-nuoc": "generated-combo-gia-dinh-6-mieng-ga.png",
  "combo-ga-cay-khoai-nuoc": "generated-combo-gia-dinh-6-mieng-ga.png",
  "combo-burger-ga": "generated-combo-burger-ga.png",
  "combo-gia-dinh-6-mieng-ga": "generated-combo-gia-dinh-6-mieng-ga.png",
  "khoai-tay-chien": "generated-pho-mai-que.png",
  "khoai-tay-lac-bbq-vua": "generated-pho-mai-que.png",
  "salad-bap-cai": "generated-salad-bap-cai.png",
  "pho-mai-que": "generated-pho-mai-que.png",
  "coca-cola": "generated-coca-cola.png",
  "tra-dao": "generated-tra-dao.png",
  "tra-chanh": "generated-tra-chanh.png",
};

async function main() {
  await mongoose.connect(dbURI);

  for (const [slug, fileName] of Object.entries(imageBySlug)) {
    const image = `${baseApi}/uploads/${fileName}`;
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
