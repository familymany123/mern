const Order = require("../models/order.model.js");

class StatisticController {
    //[GET] /statistics/monthly_revenue
    async monthly_revenue(req, res) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const startOfYear = new Date(year, 0, 1);
            const startOfNextYear = new Date(year + 1, 0, 1);

            const monthlyRevenue = await Order.aggregate([
                {
                    $match: {
                        status: "Completed",
                        created_at: { $gte: startOfYear, $lt: startOfNextYear }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$created_at" }, // Group by month of created_at
                        totalRevenue: { $sum: "$amount" } // Sum the amount for each month
                    }
                },
                {
                    $project: {
                        month: "$_id",
                        totalRevenue: 1,
                        _id: 0
                    }
                }
            ]);

            // Initialize an array of 12 elements, each set to 0
            const fullYearRevenue = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                totalRevenue: 0
            }));

            // Map aggregated results to the fullYearRevenue array
            monthlyRevenue.forEach(result => {
                fullYearRevenue[result.month - 1].totalRevenue = result.totalRevenue;
            });

            res.json(fullYearRevenue);
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving monthly revenue', error });
        }
    }

    //[GET] /statistics/monthly_order_count
    async monthly_order_count(req, res) {
        try {
            const year = parseInt(req.query.year) || new Date().getFullYear();
            const startOfYear = new Date(year, 0, 1);
            const startOfNextYear = new Date(year + 1, 0, 1);

            const monthlyOrderCount = await Order.aggregate([
                {
                    $match: {
                        created_at: { $gte: startOfYear, $lt: startOfNextYear }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$created_at" }, // Group by month of created_at
                        orderCount: { $sum: 1 } // Count each order as 1
                    }
                },
                {
                    $project: {
                        month: "$_id",
                        orderCount: 1,
                        _id: 0
                    }
                }
            ]);

            // Initialize an array of 12 elements, each set to 0
            const fullYearOrderCount = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                orderCount: 0
            }));

            // Map aggregated results to the fullYearOrderCount array
            monthlyOrderCount.forEach(result => {
                fullYearOrderCount[result.month - 1].orderCount = result.orderCount;
            });

            res.json(fullYearOrderCount);
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving monthly order count', error });
        }
    }

    //[GET] /statistics/current_revenue
    async current_revenue(req, res) {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [dailyRevenue, weeklyRevenue, monthlyRevenue] = await Promise.all([
                Order.aggregate([
                    { $match: { status: "Completed", created_at: { $gte: startOfDay } } },
                    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
                    { $project: { _id: 0, totalRevenue: { $ifNull: ["$totalRevenue", 0] } } }
                ]),
                Order.aggregate([
                    { $match: { status: "Completed", created_at: { $gte: startOfWeek } } },
                    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
                    { $project: { _id: 0, totalRevenue: { $ifNull: ["$totalRevenue", 0] } } }
                ]),
                Order.aggregate([
                    { $match: { status: "Completed", created_at: { $gte: startOfMonth } } },
                    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
                    { $project: { _id: 0, totalRevenue: { $ifNull: ["$totalRevenue", 0] } } }
                ])
            ]);

            res.json({
                dailyRevenue: dailyRevenue[0]?.totalRevenue || 0,
                weeklyRevenue: weeklyRevenue[0]?.totalRevenue || 0,
                monthlyRevenue: monthlyRevenue[0]?.totalRevenue || 0
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving current revenue', error });
        }
    }

    //[GET] /statistics/current_order_count
    async current_order_count(req, res) {
        try {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const [dailyOrders, weeklyOrders, monthlyOrders] = await Promise.all([
                Order.aggregate([
                    { $match: { created_at: { $gte: startOfDay } } },
                    { $count: "orderCount" }
                ]),
                Order.aggregate([
                    { $match: { created_at: { $gte: startOfWeek } } },
                    { $count: "orderCount" }
                ]),
                Order.aggregate([
                    { $match: { created_at: { $gte: startOfMonth } } },
                    { $count: "orderCount" }
                ])
            ]);

            res.json({
                dailyOrders: dailyOrders[0]?.orderCount || 0,
                weeklyOrders: weeklyOrders[0]?.orderCount || 0,
                monthlyOrders: monthlyOrders[0]?.orderCount || 0
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error retrieving current order count', error });
        }
    }

    //[GET] /statistics/percent
    async percent(req, res) {
        try {
            const range = req.query.range || "today";
            const now = new Date();
            const match = {};

            if (range === "today") {
                match.created_at = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                    $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
                };
            } else if (range === "month") {
                match.created_at = {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                };
            }

            // Sử dụng aggregation để đếm số lượng từng trạng thái
            const orders = await Order.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: "$status", // Nhóm theo trạng thái
                        count: { $sum: 1 }, // Đếm số lượng mỗi trạng thái
                    },
                },
                {
                    $project: {
                        status: "$_id",
                        count: 1,
                        _id: 0,
                    },
                },
            ]);
        
            // Lấy tổng số đơn hàng
            const totalOrders = orders.reduce((acc, item) => acc + item.count, 0);
        
            // Tạo một đối tượng map để chuyển đổi status sang tiếng Việt
            const statusTranslations = {
                "Pending": "Chờ xử lý",
                "Processing": "Đang xử lý",
                "Completed": "Hoàn thành",
                "Cancelled": "Đã hủy",
            };
        
            // Tính phần trăm và chuyển đổi status sang tiếng Việt
            const result = totalOrders === 0 ? [] : orders.map((item) => ({
                code: item.status,
                status: statusTranslations[item.status] || item.status, // Chuyển sang tiếng Việt
                percent: ((item.count / totalOrders) * 100).toFixed(2),
                count: item.count,
            }));
        
            return res.status(200).json({ range, totalOrders, result });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    //[GET] /statistics/revenue_day_of_month
    async revenue_day_of_month(req, res) {
        try {
            // Lấy tháng từ query, nếu không có thì mặc định là tháng hiện tại
            const month = parseInt(req.query.month) || new Date().getMonth() + 1;
            const year = parseInt(req.query.year) || new Date().getFullYear();
    
            // Tính ngày bắt đầu và kết thúc của tháng
            const startDate = new Date(year, month - 1, 1); // Ngày 1 của tháng
            const endDate = new Date(year, month, 1);
    
            // Lấy tổng doanh thu theo từng ngày trong tháng
            const revenueByDay = await Order.aggregate([
                {
                    $match: {
                        status: "Completed",
                        created_at: { // Lọc các đơn hàng trong tháng nhất định
                            $gte: startDate,
                            $lt: endDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: { $dayOfMonth: "$created_at" }, // Nhóm theo ngày trong tháng
                        totalRevenue: { $sum: "$amount" }, // Tổng doanh thu theo ngày
                    },
                },
                {
                    $sort: { _id: 1 }, // Sắp xếp theo thứ tự ngày trong tháng
                },
                {
                    $project: {
                        day: "$_id", // Đổi tên _id thành day
                        totalRevenue: 1, // Giữ lại tổng doanh thu
                        _id: 0, // Loại bỏ _id
                    },
                },
            ]);
    
            // Tạo một mảng với tất cả các ngày trong tháng
            const allDays = Array.from({ length: new Date(year, month, 0).getDate() }, (_, index) => index + 1);
    
            // Dựng lại dữ liệu với tất cả các ngày trong tháng, gán doanh thu là 0 nếu ngày đó không có dữ liệu
            const revenueResult = allDays.map(day => {
                const data = revenueByDay.find(item => item.day === day);
                return {
                    day,
                    totalRevenue: data ? data.totalRevenue : 0, // Nếu không có dữ liệu, gán doanh thu là 0
                };
            });
    
            // Trả về kết quả
            return res.status(200).json({
                month,
                year,
                revenueByDay: revenueResult,
            });
    
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}

module.exports = new StatisticController();
