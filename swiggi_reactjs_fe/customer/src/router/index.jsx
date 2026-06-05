import { createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import ProfileLayout from "../layouts/ProfileLayout";
import {
  Checkout,
  ContactUs,
  Faq,
  FoodByCategory,
  Foods,
  Home,
  Login,
  Map,
  MostPopular,
  MyOrder,
  NotFound,
  Offers,
  OrderDetail,
  OrderSuccess,
  Privacy,
  Profile,
  Search,
  Signup,
  Term,
  Trendding,
} from "../pages";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
       {
    path: "home",
    element: <Home />,
    },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "most_popular",
        element: <MostPopular />,
      },
      {
        path: "/search",
        element: <Search />,
      },

      {
        path: "offers",
        element: <Offers />,
      },
      {
        path: "foods/:id",
        element: <Foods />,
      },
      {
        path: "category/:id",
        element: <FoodByCategory />,
      },
      {
        path: "trending",
        element: <Trendding />,
      },

      {
        path: "orderSuccess",
        element: <OrderSuccess />,
      },

      {
        path: "map",
        element: <Map />,
      },
      {
        path: "",
        element: <ProfileLayout />,
        children: [
          {
            path: "profile",
            element: <Profile />,
          },
          {
            path: "terms",
            element: <Term />,
          },
          {
            path: "contact",
            element: <ContactUs />,
          },
          {
            path: "privacy",
            element: <Privacy />,
          },
          {
            path: "faq",
            element: <Faq />,
          },
          {
            path: "my_order",
            element: <MyOrder />,
          },
          {
            path: "order-detail/:id",
            element: <OrderDetail />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "sign-up",
        element: <Signup />,
      },
    ],
  },
]);

export default router;
