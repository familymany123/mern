const mongoose = require("mongoose");
const DetailOrder = require("../models/detail_orders.model");
const Food = require("../models/food.model");
const Order = require("../models/order.model");
const Recommendation = require("../models/recommendation.model");

const MAX_RECOMMENDATIONS_PER_FOOD = 12;
const DEFAULT_LIMIT = 4;

const normalizeId = (value) => value?.toString();

const getUniqueFoodIds = (details) => {
  const ids = new Set();
  details.forEach((detail) => {
    const foodId = normalizeId(detail.food?._id || detail.food);
    if (foodId) ids.add(foodId);
  });
  return Array.from(ids);
};

const addPair = (statsByFood, sourceId, targetId) => {
  if (sourceId === targetId) return;

  if (!statsByFood.has(sourceId)) {
    statsByFood.set(sourceId, {
      sourceOrderCount: 0,
      targets: new Map(),
    });
  }

  const stats = statsByFood.get(sourceId);
  stats.targets.set(targetId, (stats.targets.get(targetId) || 0) + 1);
};

const buildDocumentsFromStats = (statsByFood) => {
  const docs = [];

  statsByFood.forEach((stats, sourceId) => {
    const recommendations = Array.from(stats.targets.entries())
      .map(([targetId, boughtTogether]) => {
        const confidence = stats.sourceOrderCount
          ? boughtTogether / stats.sourceOrderCount
          : 0;

        return {
          food: new mongoose.Types.ObjectId(targetId),
          score: Number((confidence * Math.log1p(boughtTogether)).toFixed(6)),
          boughtTogether,
          confidence: Number(confidence.toFixed(6)),
        };
      })
      .sort((a, b) => b.score - a.score || b.boughtTogether - a.boughtTogether)
      .slice(0, MAX_RECOMMENDATIONS_PER_FOOD);

    docs.push({
      food: new mongoose.Types.ObjectId(sourceId),
      recommendations,
      sourceOrderCount: stats.sourceOrderCount,
      updated_at: new Date(),
    });
  });

  return docs;
};

async function trainFromAllOrders() {
  const orders = await Order.find({ status: "Completed" }).select("_id").lean();
  const orderIds = orders.map((order) => order._id);

  const details = await DetailOrder.find({ order: { $in: orderIds } })
    .select("order food")
    .lean();

  const detailsByOrder = new Map();
  details.forEach((detail) => {
    const orderId = normalizeId(detail.order);
    if (!detailsByOrder.has(orderId)) {
      detailsByOrder.set(orderId, []);
    }
    detailsByOrder.get(orderId).push(detail);
  });

  const statsByFood = new Map();

  detailsByOrder.forEach((orderDetails) => {
    const foodIds = getUniqueFoodIds(orderDetails);
    if (foodIds.length < 2) return;

    foodIds.forEach((sourceId) => {
      if (!statsByFood.has(sourceId)) {
        statsByFood.set(sourceId, {
          sourceOrderCount: 0,
          targets: new Map(),
        });
      }

      statsByFood.get(sourceId).sourceOrderCount += 1;

      foodIds.forEach((targetId) => {
        addPair(statsByFood, sourceId, targetId);
      });
    });
  });

  const docs = buildDocumentsFromStats(statsByFood);

  await Recommendation.deleteMany({});

  if (docs.length) {
    await Recommendation.bulkWrite(
      docs.map((doc) => ({
        updateOne: {
          filter: { food: doc.food },
          update: { $set: doc },
          upsert: true,
        },
      }))
    );
  }

  return {
    sourceOrders: orders.length,
    trainedFoods: docs.length,
  };
}

async function learnFromOrder(orderId) {
  const order = await Order.findById(orderId).select("status").lean();
  if (!order || order.status !== "Completed") {
    return { updated: false, reason: "order_not_completed" };
  }

  return trainFromAllOrders();
}

async function getRecommendations(foodIds = [], limit = DEFAULT_LIMIT) {
  const uniqueFoodIds = Array.from(new Set(foodIds.map(normalizeId).filter(Boolean)));
  if (!uniqueFoodIds.length) return [];

  const cartIdSet = new Set(uniqueFoodIds);
  const docs = await Recommendation.find({
    food: { $in: uniqueFoodIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).lean();

  const scores = new Map();
  docs.forEach((doc) => {
    doc.recommendations.forEach((item) => {
      const targetId = normalizeId(item.food);
      if (!targetId || cartIdSet.has(targetId)) return;

      const current = scores.get(targetId) || {
        foodId: targetId,
        score: 0,
        boughtTogether: 0,
        confidence: 0,
      };

      current.score += item.score;
      current.boughtTogether += item.boughtTogether;
      current.confidence = Math.max(current.confidence, item.confidence);
      scores.set(targetId, current);
    });
  });

  const ranked = Array.from(scores.values())
    .sort((a, b) => b.score - a.score || b.boughtTogether - a.boughtTogether)
    .slice(0, limit);

  if (!ranked.length) return [];

  const foods = await Food.find({
    _id: { $in: ranked.map((item) => item.foodId) },
    show: true,
  })
    .populate("category")
    .lean();

  const rankMap = new Map(ranked.map((item, index) => [item.foodId, index]));

  return foods
    .sort((a, b) => rankMap.get(normalizeId(a._id)) - rankMap.get(normalizeId(b._id)))
    .map((food) => ({
      _id: food._id,
      name: food.name,
      price: food.price,
      image: food.image,
      slug: food.slug,
      cooking_time: food.cooking_time,
      category: food.category,
    }));
}

module.exports = {
  trainFromAllOrders,
  learnFromOrder,
  getRecommendations,
};
