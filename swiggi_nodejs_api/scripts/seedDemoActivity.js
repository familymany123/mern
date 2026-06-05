const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../app/models/user.model");
const Food = require("../app/models/food.model");
const Topping = require("../app/models/topping.model");
const Order = require("../app/models/order.model");
const DetailOrder = require("../app/models/detail_orders.model");
const Review = require("../app/models/review.model");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/swiggi";

const CUSTOMER_COUNT = 32;
const ORDER_COUNT = 140;
const DEMO_USERNAME_PREFIX = "demo_customer_";
const DEMO_ORDER_PREFIX = "DEMO";

const customerProfiles = [
  ["Nguyen Minh Anh", "0908123456", "12 Nguyen Van Bao, Go Vap"],
  ["Tran Hoang Nam", "0917345678", "45 Le Van Viet, Thu Duc"],
  ["Le Thu Thao", "0932456789", "88 Pham Van Dong, Binh Thanh"],
  ["Pham Quoc Huy", "0978567890", "21 Vo Van Ngan, Thu Duc"],
  ["Vo Thanh Truc", "0987654321", "19 Dinh Tien Hoang, Quan 1"],
  ["Dang Gia Bao", "0965123789", "72 Nguyen Trai, Quan 5"],
  ["Bui Kim Ngan", "0944234567", "31 Nguyen Thi Minh Khai, Quan 3"],
  ["Do Minh Khang", "0922987654", "09 Xa Lo Ha Noi, Thu Duc"],
  ["Huynh Ngoc Mai", "0909555123", "66 Dien Bien Phu, Binh Thanh"],
  ["Phan Anh Tu", "0912888999", "28 Cach Mang Thang 8, Quan 10"],
  ["Ngo Bao Chau", "0933888222", "15 Le Duc Tho, Go Vap"],
  ["Ly Thanh Son", "0977333444", "93 Hoang Dieu 2, Thu Duc"],
];

const reviewContents = [
  "Mon an nong, giao nhanh, dong goi rat gon.",
  "Ga gion va sot vua mieng, se dat lai.",
  "Phan an day du, gia hop ly.",
  "Do uong mat, combo tien loi cho bua trua.",
  "Burger ngon, banh mem va nhan day dan.",
  "Mon phu gion, an kem ga rat hop.",
  "Dat buoi toi van giao dung gio.",
  "Huong vi on dinh, phu hop cho ca nha.",
  "Dong goi can than, khong bi do nuoc.",
  "Gia tot so voi chat luong.",
];

const statusWeights = [
  ["Completed", 94],
  ["Cancelled", 6],
];

const paymentWeights = [
  ["Cod", 75],
  ["Bank", 25],
];

let seed = 20260605;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};

const pick = (items) => items[Math.floor(rand() * items.length)];

const weightedPick = (items) => {
  const total = items.reduce((sum, item) => sum + item[1], 0);
  let target = rand() * total;

  for (const [value, weight] of items) {
    target -= weight;
    if (target <= 0) {
      return value;
    }
  }

  return items[items.length - 1][0];
};

const randomDateInLastDays = (days) => {
  const now = new Date();
  const past = new Date(now);
  past.setDate(now.getDate() - days);

  return new Date(past.getTime() + rand() * (now.getTime() - past.getTime()));
};

const makeOrderCode = (index, date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${DEMO_ORDER_PREFIX}${y}${m}${d}${String(index + 1).padStart(4, "0")}`;
};

async function cleanupDemoData() {
  const demoUsers = await User.find({
    username: { $regex: `^${DEMO_USERNAME_PREFIX}` },
  }).select("_id");
  const demoUserIds = demoUsers.map((user) => user._id);
  const demoOrders = await Order.find({
    code: { $regex: `^${DEMO_ORDER_PREFIX}` },
  }).select("_id");
  const demoOrderIds = demoOrders.map((order) => order._id);

  await DetailOrder.deleteMany({ order: { $in: demoOrderIds } });
  await Review.deleteMany({ user: { $in: demoUserIds } });
  await Order.deleteMany({ _id: { $in: demoOrderIds } });
  await User.deleteMany({ _id: { $in: demoUserIds } });
}

async function createUsers() {
  const password = await bcrypt.hash("123456", 10);
  const users = Array.from({ length: CUSTOMER_COUNT }, (_, index) => {
    const profile = customerProfiles[index % customerProfiles.length];
    const suffix = String(index + 1).padStart(2, "0");

    return {
      fullname: `${profile[0]} ${suffix}`,
      address: profile[2],
      phone: profile[1],
      email: `demo.customer.${suffix}@swiggi.local`,
      username: `${DEMO_USERNAME_PREFIX}${suffix}`,
      password,
      role: "customer",
      status: rand() > 0.06,
      created_at: randomDateInLastDays(180),
      updated_at: new Date(),
    };
  });

  return User.insertMany(users);
}

async function createOrders(users, foods, toppings) {
  const orders = [];
  const detailOrders = [];
  const purchasedFoods = new Map();

  for (let index = 0; index < ORDER_COUNT; index += 1) {
    const user = pick(users);
    const createdAt = randomDateInLastDays(120);
    const itemCount = 1 + Math.floor(rand() * 4);
    const selectedFoods = Array.from({ length: itemCount }, () => pick(foods));
    const selectedDetails = [];
    let amount = 0;

    for (const food of selectedFoods) {
      const quantity = 1 + Math.floor(rand() * 3);
      const selectedToppings = rand() > 0.6 ? [pick(toppings)].filter(Boolean) : [];
      const toppingTotal = selectedToppings.reduce((sum, topping) => sum + topping.price, 0);

      amount += (food.price + toppingTotal) * quantity;
      selectedDetails.push({
        food: food._id,
        toppings: selectedToppings.map((topping) => topping._id),
        quantity,
        created_at: createdAt,
        updated_at: createdAt,
      });
    }

    const ship = 8000 + Math.floor(rand() * 5) * 3000;
    const status = weightedPick(statusWeights);
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
      payment: weightedPick(paymentWeights),
      created_at: createdAt,
      updated_at: createdAt,
    });

    orders.push(order);

    for (const detail of selectedDetails) {
      detailOrders.push({ ...detail, order: order._id });

      if (status === "Completed") {
        const userKey = user._id.toString();
        const foodIds = purchasedFoods.get(userKey) || new Set();
        foodIds.add(detail.food.toString());
        purchasedFoods.set(userKey, foodIds);
      }
    }
  }

  await DetailOrder.insertMany(detailOrders);

  return { orders, purchasedFoods };
}

async function createReviews(users, foodsById, purchasedFoods) {
  const reviews = [];

  for (const user of users) {
    const foodIds = Array.from(purchasedFoods.get(user._id.toString()) || []);
    const reviewCount = Math.min(foodIds.length, Math.floor(rand() * 4));

    for (let index = 0; index < reviewCount; index += 1) {
      const foodId = foodIds.splice(Math.floor(rand() * foodIds.length), 1)[0];
      const food = foodsById.get(foodId);

      if (!food) {
        continue;
      }

      reviews.push({
        user: user._id,
        food: food._id,
        star: weightedPick([
          [5, 58],
          [4, 30],
          [3, 9],
          [2, 2],
          [1, 1],
        ]),
        content: pick(reviewContents),
        created_at: randomDateInLastDays(80),
        updated_at: new Date(),
      });
    }
  }

  if (reviews.length) {
    await Review.insertMany(reviews);
  }

  return reviews;
}

async function main() {
  await mongoose.connect(dbURI);

  const foods = await Food.find({ show: true }).lean();
  const toppings = await Topping.find().lean();

  if (!foods.length) {
    throw new Error("No foods found. Run seedFastFoodMenu.js before this script.");
  }

  await cleanupDemoData();

  const users = await createUsers();
  const { orders, purchasedFoods } = await createOrders(users, foods, toppings);
  const foodsById = new Map(foods.map((food) => [food._id.toString(), food]));
  const reviews = await createReviews(users, foodsById, purchasedFoods);

  await mongoose.disconnect();

  console.log("Demo activity seeded successfully.");
  console.log(`Users: ${users.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Reviews: ${reviews.length}`);
  console.log("Demo customer password: 123456");
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
