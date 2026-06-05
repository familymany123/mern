import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AuthProvider from "./hooks/useAdmin";
import PrivateRoute from "./layout/ProtedLayout";
import {
  AddBanner,
  AddCategory,
  AddCoupon,
  AddFood,
  AddTopping,
  AddUser,
  Banner,
  Category,
  Contact,
  Coupons,
  Districts,
  Foods,
  FoodTopping,
  Home,
  Login,
  NotFound,
  Order,
  OrderDetail,
  Provinces,
  Register,
  Setting,
  Topping,
  Users,
} from "./pages";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/add" element={<AddUser />} />
              <Route path="/foods" element={<Foods />} />
              <Route path="/foods/add" element={<AddFood />} />
              <Route path="/topping" element={<Topping />} />
              <Route path="/topping/add" element={<AddTopping />} />
              <Route path="/category" element={<Category />} />
              <Route path="/category/add" element={<AddCategory />} />

              <Route path="/coupons" element={<Coupons />} />
              <Route path="/coupons/add" element={<AddCoupon />} />
              <Route path="/food-topping" element={<FoodTopping />} />
              <Route path="/banners" element={<Banner />} />
              <Route path="/banner/add" element={<AddBanner />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/provinces" element={<Provinces />} />
              <Route path="/districts" element={<Districts />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/order/:id" element={<OrderDetail />} />
            </Route>
            {/* Other routes */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
