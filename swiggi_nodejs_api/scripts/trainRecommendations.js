const mongoose = require("mongoose");
require("dotenv").config();
const getMongoDbUri = require("../app/config/mongodbUri");
const recommenderService = require("../app/services/recommender.service");

async function main() {
  await mongoose.connect(getMongoDbUri());
  const result = await recommenderService.trainFromAllOrders();
  await mongoose.disconnect();

  console.log("Recommendation model trained successfully.");
  console.log(`Source orders: ${result.sourceOrders}`);
  console.log(`Trained foods: ${result.trainedFoods}`);
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
