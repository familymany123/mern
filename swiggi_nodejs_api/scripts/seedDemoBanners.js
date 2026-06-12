const mongoose = require("mongoose");
const Banner = require("../app/models/banner.model");
const Category = require("../app/models/category.model");
require("dotenv").config();
const getMongoDbUri = require("../app/config/mongodbUri");

const dbURI = getMongoDbUri();
const baseApi = process.env.BASE_API || "https://swiggi-api.onrender.com";

const bannerSeeds = [
  {
    slug: "combo-an-nhanh",
    image: `${baseApi}/uploads/banner-combo-sot-cay.png`,
  },
  {
    slug: "ga-ran",
    image: `${baseApi}/uploads/banner-ga-ran-gion-rum.png`,
  },
  {
    slug: "burger",
    image: `${baseApi}/uploads/banner-burger-tom.png`,
  },
  {
    slug: "mi-y",
    image: `${baseApi}/uploads/banner-mi-y.png`,
  },
  {
    slug: "mon-phu",
    image: `${baseApi}/uploads/banner-thanh-vien-moi.png`,
  },
  {
    slug: "thuc-uong",
    image: `${baseApi}/uploads/banner-combo-ga-ran.png`,
  },
];

async function main() {
  await mongoose.connect(dbURI);

  let created = 0;
  let updated = 0;

  for (const seed of bannerSeeds) {
    const category = await Category.findOne({ slug: seed.slug });

    if (!category) {
      console.log(`Skip ${seed.slug}: category not found`);
      continue;
    }

    const result = await Banner.updateOne(
      { category: category._id },
      {
        $set: {
          image: seed.image,
          category: category._id,
          show: true,
          updated_at: new Date(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount) {
      created += 1;
    } else if (result.modifiedCount) {
      updated += 1;
    }
  }

  const banners = await Banner.find()
    .populate("category", "name slug")
    .sort({ created_at: -1 })
    .lean();

  console.log(`Seeded banners. Created: ${created}, updated: ${updated}`);
  console.log(
    JSON.stringify(
      banners.map((banner) => ({
        category: banner.category?.name,
        slug: banner.category?.slug,
        show: banner.show,
        image: banner.image,
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
