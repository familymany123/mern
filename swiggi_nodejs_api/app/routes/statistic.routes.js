const express = require('express');
const router = express.Router();
const statisticController = require('../controllers/statistic.controller.js');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js')


router.get('/monthly_revenue', statisticController.monthly_revenue);
router.get('/monthly_order_count', statisticController.monthly_order_count);
router.get('/current_revenue', statisticController.current_revenue);
router.get('/current_order_count', statisticController.current_order_count);
router.get('/percent', statisticController.percent);
router.get('/revenue_day_of_month', statisticController.revenue_day_of_month);


module.exports = router;