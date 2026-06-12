const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../app/models/user.model");
require("../app/models/category.model");
const Food = require("../app/models/food.model");
const Order = require("../app/models/order.model");
const DetailOrder = require("../app/models/detail_orders.model");
require("dotenv").config();
const getMongoDbUri = require("../app/config/mongodbUri");

const dbURI = getMongoDbUri();
const USER_PREFIX = "reco_customer_";
const ORDER_PREFIX = "RECO_DEMO";
const CUSTOMER_COUNT = 36;
const ORDER_COUNT = Number(process.env.RECO_ORDER_COUNT || 360);

let seed = 20260612;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const pick = (items) => items[Math.floor(rand() * items.length)];

const weightedPick = (items) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let target = rand() * total;

  for (const item of items) {
    target -= item.weight;
    if (target <= 0) return item.value;
  }

  return items[items.length - 1].value;
};

const randomDateInLastDays = (days) => {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - days);
  return new Date(past.getTime() + rand() * (now.getTime() - past.getTime()));
};

const normalizeText = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getFoodBucket = (food) => {
  const text = normalizeText(`${food.name} ${food.category?.name || ""} ${food.type || ""}`);

  if (text.includes("nuoc") || text.includes("tra") || text.includes("coca")) return "drink";
  if (text.includes("khoai") || text.includes("pho mai") || text.includes("salad") || text.includes("mon phu")) return "side";
  if (text.includes("burger")) return "burger";
  if (text.includes("mi y") || text.includes("spaghetti")) return "pasta";
  if (text.includes("combo")) return "combo";
  if (text.includes("ga")) return "chicken";
  if (text.includes("com")) return "rice";

  return "other";
};

const buildBuckets = (foods) => {
  const buckets = {
    chicken: [],
    burger: [],
    pasta: [],
    rice: [],
    combo: [],
    side: [],
    drink: [],
    other: [],
  };

  foods.forEach((food) => {
    buckets[getFoodBucket(food)].push(food);
  });

  return buckets;
};

const pickFromBuckets = (buckets, bucketNames) => {
  for (const bucketName of bucketNames) {
    if (buckets[bucketName]?.length) {
      return pick(buckets[bucketName]);
    }
  }

  return pick(Object.values(buckets).flat());
};

const comboTemplates = [
  { main: ["chicken"], addOns: ["drink", "side"], weight: 28 },
  { main: ["chicken"], addOns: ["burger", "drink"], weight: 16 },
  { main: ["burger"], addOns: ["side", "drink"], weight: 24 },
  { main: ["pasta"], addOns: ["drink", "side"], weight: 13 },
  { main: ["rice"], addOns: ["drink", "side"], weight: 8 },
  { main: ["combo"], addOns: ["drink", "side"], weight: 7 },
  { main: ["side"], addOns: ["drink"], weight: 4 },
];

const makeOrderCode = (index, date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${ORDER_PREFIX}${y}${m}${d}${String(index + 1).padStart(4, "0")}`;
};

async function cleanupRecommendationDemoData() {
  const demoOrders = await Order.find({ code: { $regex: `^${ORDER_PREFIX}` } }).select("_id");
  const demoOrderIds = demoOrders.map((order) => order._id);
  const demoUsers = await User.find({ username: { $regex: `^${USER_PREFIX}` } }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);

  await DetailOrder.deleteMany({ order: { $in: demoOrderIds } });
  await Order.deleteMany({ _id: { $in: demoOrderIds } });
  await User.deleteMany({ _id: { $in: demoUserIds } });
}

async function createRecommendationUsers() {
  const password = await bcrypt.hash("123456", 10);

  const users = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const suffix = String(index + 1).padStart(2, "0");
    return {
      fullname: `Reco Customer ${suffix}`,
      address: `${12 + index} Nguyen Van Bao, Go Vap, TP. Ho Chi Minh`,
      phone: `09${String(10000000 + index).slice(0, 8)}`,
      email: `reco.customer.${suffix}@swiggi.local`,
      username: `${USER_PREFIX}${suffix}`,
      password,
      role: "customer",
      status: true,
      created_at: randomDateInLastDays(180),
      updated_at: new Date(),
    };
  });

  return User.insertMany(users);
}

function makeOrderItems(buckets) {
  const template = weightedPick(comboTemplates.map((template) => ({
    value: template,
    weight: template.weight,
  })));
  const selected = new Map();

  const mainFood = pickFromBuckets(buckets, template.main);
  selected.set(mainFood._id.toString(), {
    food: mainFood,
    quantity: 1 + Math.floor(rand() * 2),
  });

  template.addOns.forEach((bucketName) => {
    const food = pickFromBuckets(buckets, [bucketName, "other"]);
    selected.set(food._id.toString(), {
      food,
      quantity: 1 + (rand() > 0.86 ? 1 : 0),
    });
  });

  if (rand() > 0.72) {
    const extraFood = pickFromBuckets(buckets, ["drink", "side", "burger", "pasta"]);
    selected.set(extraFood._id.toString(), { food: extraFood, quantity: 1 });
  }

  return Array.from(selected.values());
}

async function createRecommendationOrders(users, buckets) {
  const detailOrders = [];
  const orders = [];

  for (let index = 0; index < ORDER_COUNT; index += 1) {
    const user = pick(users);
    const createdAt = randomDateInLastDays(150);
    const items = makeOrderItems(buckets);
    const amount = items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
    const status = rand() > 0.05 ? "Completed" : "Cancelled";
    const ship = 8000 + Math.floor(rand() * 5) * 3000;

    const order = await Order.create({
      code: makeOrderCode(index, createdAt),
      user: user._id,
      address: user.address,
      phone: user.phone,
      amount,
      coupon: null,
      status,
      ship,
      distance: `${(1 + rand() * 8).toFixed(1)} km`,
      timeShip: `${15 + Math.floor(rand() * 26)} phut`,
      payment: rand() > 0.72 ? "Bank" : "Cod",
      created_at: createdAt,
      updated_at: createdAt,
    });

    orders.push(order);

    items.forEach((item) => {
      detailOrders.push({
        order: order._id,
        food: item.food._id,
        toppings: [],
        quantity: item.quantity,
        created_at: createdAt,
        updated_at: createdAt,
      });
    });
  }

  await DetailOrder.insertMany(detailOrders);
  return { orders, detailOrders };
}

async function main() {
  await mongoose.connect(dbURI);

  const foods = await Food.find({ show: true }).populate("category").lean();
  if (foods.length < 4) {
    throw new Error("Need at least 4 visible foods to seed recommendation orders.");
  }

  await cleanupRecommendationDemoData();
  const users = await createRecommendationUsers();
  const buckets = buildBuckets(foods);
  const { orders, detailOrders } = await createRecommendationOrders(users, buckets);

  await mongoose.disconnect();

  console.log("Recommendation demo orders seeded successfully.");
  console.log(`Users: ${users.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Detail orders: ${detailOrders.length}`);
  console.log(`Prefix: ${ORDER_PREFIX}`);
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
