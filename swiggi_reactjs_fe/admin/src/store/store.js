import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import bannerReducer from "../features/banner/bannerSlice";
import categoryReducer from "../features/category/categorySlice";
import contactReducer from "../features/contact/contactSlice";
import couponReducer from "../features/coupons/couponSlice";
import districtReducer from "../features/district/districtSlice";
import foodReducer from "../features/foods/foodSlice";
import orderReducer from '../features/order/orderSlice';
import provinceReducer from "../features/provinces/provinceSlice";
import settingReducer from "../features/setting/settingSlice";
import currentOrderReducer from "../features/statistic/currentOrderSlice";
import currentRevenueReducer from "../features/statistic/currentRevenueSlice";
import monthlyOrderReducer from "../features/statistic/monthlyOrderSlice";
import monthlyRevenueReducer from "../features/statistic/monthlyRevenueSlice";
import toppingReducer from "../features/topping/toppingSlice";
import userReducer from "../features/user/userSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    coupons: couponReducer,
    category: categoryReducer,
    foods: foodReducer,
    toppings: toppingReducer,
    contacts: contactReducer,
    settings: settingReducer,
    banners: bannerReducer,
    provinces: provinceReducer,
    districts: districtReducer,
    orders:orderReducer,
    monthlyRevenue: monthlyRevenueReducer,
    monthlyOrder: monthlyOrderReducer,
    currentRevenue: currentRevenueReducer,
    currentOrder: currentOrderReducer,

  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: true,
});
