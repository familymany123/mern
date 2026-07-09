const recommenderService = require("../services/recommender.service");

class RecommendationController {
  async index(req, res) {
    try {
      const { foodIds = [], limit = 5 } = req.body;

      if (!Array.isArray(foodIds) || !foodIds.length) {
        return res.json({ recommendations: [] });
      }

      const recommendations = await recommenderService.getRecommendations(
        foodIds,
        Math.min(Math.max(Number(limit) || 5, 1), 8)
      );

      return res.json({ recommendations });
    } catch (error) {
      return res.status(500).json({
        message: "Khong the lay goi y mon an",
        error,
      });
    }
  }

  async train(req, res) {
    try {
      const result = await recommenderService.trainFromAllOrders();
      return res.json({
        message: "Da train goi y mon an thanh cong",
        result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Khong the train goi y mon an",
        error,
      });
    }
  }
}

module.exports = new RecommendationController();
