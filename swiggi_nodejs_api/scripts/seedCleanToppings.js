const mongoose = require("mongoose");
const Cart = require("../app/models/cart.model");
require("../app/models/category.model");
const DetailOrder = require("../app/models/detail_orders.model");
const Food = require("../app/models/food.model");
const FoodTopping = require("../app/models/foodTopping.model");
const Topping = require("../app/models/topping.model");
require("dotenv").config();
const getMongoDbUri = require("../app/config/mongodbUri");

const dbURI = getMongoDbUri();

const toppings = [
  { key: "tuong-ca", name: "2 gói tương cà", price: 1000 },
  { key: "tuong-ot", name: "2 gói tương ớt", price: 1000 },
  { key: "sot-cay", name: "Sốt cay", price: 3000 },
  { key: "sot-mayonnaise", name: "Sốt mayonnaise", price: 4000 },
  { key: "sot-bbq", name: "Sốt BBQ", price: 5000 },
  { key: "sot-pho-mai", name: "Sốt phô mai", price: 5000 },
  { key: "pho-mai-lat", name: "Phô mai lát", price: 7000 },
  { key: "trung-op-la", name: "Trứng ốp la", price: 8000 },
];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const wantedNameKeys = new Set(toppings.map((topping) => normalize(topping.name)));

function toppingKeysForFood(food) {
  const name = normalize(food.name);
  const category = normalize(food.category?.name);

  if (category.includes("thuc uong")) {
    return [];
  }

  if (category.includes("burger") || name.includes("burger")) {
    return ["tuong-ca", "tuong-ot", "sot-bbq", "sot-mayonnaise", "pho-mai-lat"];
  }

  if (category.includes("mi y") || name.includes("mi y")) {
    return ["sot-cay", "sot-pho-mai", "sot-mayonnaise"];
  }

  if (name.includes("com")) {
    return ["tuong-ca", "tuong-ot", "sot-cay", "sot-bbq", "trung-op-la"];
  }

  if (category.includes("combo")) {
    return ["tuong-ca", "tuong-ot", "sot-cay", "sot-bbq", "sot-pho-mai"];
  }

  if (category.includes("ga ran")) {
    return ["tuong-ca", "tuong-ot", "sot-cay", "sot-bbq", "sot-pho-mai"];
  }

  return ["tuong-ca", "tuong-ot", "sot-cay"];
}

async function seedToppings() {
  const existingToppings = await Topping.find();
  const byNormalizedName = new Map(
    existingToppings.map((topping) => [normalize(topping.name), topping])
  );
  const toppingByKey = new Map();

  for (const data of toppings) {
    let topping = byNormalizedName.get(normalize(data.name));

    if (!topping) {
      topping = await Topping.create({ name: data.name, price: data.price });
      console.log(`Created topping: ${data.name}`);
    } else {
      topping.name = data.name;
      topping.price = data.price;
      topping.updated_at = Date.now();
      await topping.save();
      console.log(`Updated topping: ${data.name}`);
    }

    toppingByKey.set(data.key, topping);
  }

  const toppingsToDelete = existingToppings.filter(
    (topping) => !wantedNameKeys.has(normalize(topping.name))
  );
  const deletedToppingIds = toppingsToDelete.map((topping) => topping._id);

  if (deletedToppingIds.length > 0) {
    await FoodTopping.deleteMany({ topping: { $in: deletedToppingIds } });
    await Cart.updateMany({}, { $pull: { toppings: { $in: deletedToppingIds } } });
    await DetailOrder.updateMany({}, { $pull: { toppings: { $in: deletedToppingIds } } });
    await Topping.deleteMany({ _id: { $in: deletedToppingIds } });
    console.log(`Deleted ${deletedToppingIds.length} old toppings`);
  }

  return toppingByKey;
}

async function relinkFoodToppings(toppingByKey) {
  await FoodTopping.deleteMany({});

  const foods = await Food.find().populate("category").lean();
  const links = [];

  for (const food of foods) {
    const keys = toppingKeysForFood(food);

    for (const key of keys) {
      const topping = toppingByKey.get(key);
      if (topping) {
        links.push({
          food: food._id,
          topping: topping._id,
        });
      }
    }
  }

  if (links.length > 0) {
    await FoodTopping.insertMany(links, { ordered: false });
  }

  console.log(`Created ${links.length} food-topping links`);
}

async function main() {
  await mongoose.connect(dbURI);
  await FoodTopping.syncIndexes();
  const toppingByKey = await seedToppings();
  await relinkFoodToppings(toppingByKey);

  const finalToppings = await Topping.find().sort({ price: 1, name: 1 }).lean();
  console.log(
    JSON.stringify(
      finalToppings.map((topping) => ({ name: topping.name, price: topping.price })),
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
