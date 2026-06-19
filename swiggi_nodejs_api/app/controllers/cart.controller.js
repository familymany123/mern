const Cart = require("../models/cart.model");
const FoodTopping = require("../models/foodTopping.model");

class CartController {
    // [GET] /carts
    async index(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query; 
            const userId = req.user.userId;

            const totalCarts = await Cart.countDocuments({ user: userId });

            const carts = await Cart.find({ user: userId })
                .populate('food')
                .populate('toppings')
                .limit(limit * 1) 
                .skip((page - 1) * limit) 
                .sort({ created_at: -1 }) 
                .exec();

            if (!carts.length) {
                return res.status(404).json({ message: 'Giỏ hàng hiện trống' });
            }

            const formattedCarts = carts.map(cart => ({
                _id: cart._id,
                food: cart.food,
                toppings: cart.toppings,
                quantity: cart.quantity,
                created_at: cart.created_at,
                updated_at: cart.updated_at
            }));

            // Pagination details
            const totalPages = Math.ceil(totalCarts / limit);
            const nextPage = (page < totalPages) ? parseInt(page) + 1 : null;
            const prevPage = (page > 1) ? parseInt(page) - 1 : null;

            // Formatted response
            return res.json({
                carts: formattedCarts,
                totalPages,
                currentPage: parseInt(page),
                next: nextPage,
                prev: prevPage
            });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi khi truy xuất giỏ hàng', error });
        }
    }


    // [POST] /carts
    async create(req, res) {
        try {
            const { food, toppings = [], quantity } = req.body;

            if (!food || !quantity || quantity < 1) {
                return res.status(400).json({ message: 'Thực phẩm và số lượng là bắt buộc và phải lớn hơn 0' });
            }

            const foodId = typeof food === "object" ? food._id : food;
            const toppingIds = [...new Set(
                toppings.map((topping) =>
                    String(typeof topping === "object" ? topping._id : topping)
                )
            )].sort();

            if (toppingIds.length > 0) {
                const validToppingsCount = await FoodTopping.countDocuments({
                    food: foodId,
                    topping: { $in: toppingIds }
                });

                if (validToppingsCount !== toppingIds.length) {
                    return res.status(400).json({ message: 'Topping khong hop le voi mon da chon' });
                }
            }

            const cartsForFood = await Cart.find({
                user: req.user.userId,
                food: foodId
            });
            const matchingCarts = cartsForFood.filter((cart) => {
                const existingToppingIds = cart.toppings
                    .map((toppingId) => String(toppingId))
                    .sort();

                return existingToppingIds.length === toppingIds.length &&
                    existingToppingIds.every((toppingId, index) =>
                        toppingId === toppingIds[index]
                    );
            });

            if (matchingCarts.length > 0) {
                const [existingCart, ...duplicateCarts] = matchingCarts;
                existingCart.quantity = matchingCarts.reduce(
                    (total, cart) => total + cart.quantity,
                    Number(quantity)
                );
                existingCart.updated_at = new Date();
                await existingCart.save();

                if (duplicateCarts.length > 0) {
                    await Cart.deleteMany({
                        _id: { $in: duplicateCarts.map((cart) => cart._id) }
                    });
                }

                return res.json({
                    message: 'Cap nhat so luong trong gio hang thanh cong',
                    cart: existingCart
                });
            }

            const newCart = new Cart({
                user: req.user.userId,
                food: foodId,
                toppings: toppingIds,
                quantity
            });
            await newCart.save();

            return res.status(201).json({ message: 'Thêm vào giỏ hàng thành công', cart: newCart });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi khi thêm vào giỏ hàng', error });
        }
    }

    // [PUT] /carts/:id
    async update(req, res) {
        try {
            const { quantity } = req.body;

            if (!quantity || quantity < 1) {
                return res.status(400).json({ message: 'Số lượng phải lớn hơn 0' });
            }

            const cart = await Cart.findById(req.params.id);
            if (!cart || cart.user.toString() !== req.user.userId) {
                return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
            }

            cart.quantity = quantity;
            await cart.save();

            return res.json({ message: 'Cập nhật giỏ hàng thành công', cart });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi khi cập nhật giỏ hàng', error });
        }
    }

    // [DELETE] /carts/:id
    async delete(req, res) {
        try {
            const cart = await Cart.findById(req.params.id);

            if (!cart || cart.user.toString() !== req.user.userId) {
                return res.status(404).json({ message: 'Không tìm thấy giỏ hàng' });
            }

            await cart.deleteOne();
            return res.json({ message: 'Xóa sản phẩm khỏi giỏ hàng thành công' });
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi khi xóa sản phẩm khỏi giỏ hàng', error });
        }
    }
}

module.exports = new CartController();
