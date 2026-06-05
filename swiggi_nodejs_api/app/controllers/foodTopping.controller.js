const FoodTopping = require("../models/foodTopping.model.js");
const Food = require("../models/food.model.js");
const Topping = require("../models/topping.model.js");

class FoodToppingController {
  // [GET] /foods/topping/:id
  async show(req, res) {
    try {
      const foodToppings = await FoodTopping.find({ food: req.params.id })
        .populate("food")
        .populate("topping");

      return res.json(foodToppings);
    } catch (error) {
      return res.status(500).json({ message: "Loi khi truy xuat Food-Topping", error });
    }
  }

  // [POST] /foods/topping
  async create(req, res) {
    try {
      const { food, topping } = req.body;

      if (!food || !topping) {
        return res.status(400).json({ message: "Food va Topping la bat buoc." });
      }

      const foodExists = await Food.findById(food);
      const toppingExists = await Topping.findById(topping);
      if (!foodExists || !toppingExists) {
        return res.status(400).json({ message: "Food hoac Topping khong ton tai." });
      }

      const existingFoodTopping = await FoodTopping.findOne({ food, topping });
      if (existingFoodTopping) {
        return res.status(409).json({ message: "Topping da duoc them vao mon nay." });
      }

      const foodTopping = new FoodTopping({ food, topping });
      await foodTopping.save();

      return res.status(201).json({ message: "Tao Food-Topping thanh cong", foodTopping });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "Topping da duoc them vao mon nay." });
      }

      return res.status(500).json({ message: "Loi khi tao Food-Topping", error });
    }
  }

  // [DELETE] /foods/topping/:id
  async delete(req, res) {
    try {
      const foodTopping = await FoodTopping.findByIdAndDelete(req.params.id);
      if (!foodTopping) {
        return res.status(404).json({ message: "Khong tim thay Food-Topping" });
      }
      return res.json({ message: "Xoa Food-Topping thanh cong" });
    } catch (error) {
      return res.status(500).json({ message: "Loi khi xoa Food-Topping", error });
    }
  }
}

module.exports = new FoodToppingController();
