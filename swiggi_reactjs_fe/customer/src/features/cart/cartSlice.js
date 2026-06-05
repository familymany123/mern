import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

const initialState = {
  items: [],
  totalAmount: 0,
  status: "idle",
  error: null,
};

// Thunk để gọi API thêm sản phẩm vào giỏ hàng
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async ({ food, toppings = [], quantity }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/carts", {
        food,
        toppings,
        quantity,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk để gọi API xóa sản phẩm khỏi giỏ hàng
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (id, { rejectWithValue }) => {
    try {
      await baseApi.delete(`/carts/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Thunk để gọi API lấy danh sách sản phẩm trong giỏ hàng
export const fetchCartItems = createAsyncThunk(
  "cart/fetchCartItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await baseApi.get("/carts");
      return response.data.carts;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// thunk để gọi API update số lượng sản phẩm trong giỏ hàng
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(`/carts/${id}`, { quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart(state) {
      state.items = [];
      state.totalAmount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItemToCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        // state.status = "succeeded";
        // console.log(action.payload.cart);
        // const { food, toppings, quantity } = action.payload;
        // const existingItem = state.items.find(
        //   (item) => item.food._id === food._id
        // );
        // const toppingsPrice = toppings.reduce(
        //   (total, topping) => total + topping.price,
        //   0
        // );
        // const totalPrice = (food.price + toppingsPrice) * quantity;

        // if (existingItem) {
        //   existingItem.quantity += quantity;
        //   existingItem.totalPrice += totalPrice;
        //   existingItem.toppings = [...existingItem.toppings, ...toppings];
        // } else {
        //   state.items.push({
        //     food,
        //     toppings,
        //     quantity,
        //     totalPrice,
        //   });
        // }
        // state.totalAmount += totalPrice;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(removeItemFromCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCartItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.map((cartItem) => {
          const toppingsPrice = cartItem.toppings.reduce(
            (total, topping) => total + topping.price,
            0
          );
          const totalPrice =
            (cartItem.food.price + toppingsPrice) * cartItem.quantity;
          return {
            ...cartItem,
            totalPrice,
          };
        });
        state.totalAmount = state.items.reduce(
          (total, item) => total + item.totalPrice,
          0
        );
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCartItem.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { _id, quantity } = action.payload.cart;
        console.log(action.payload.cart);
        const updatedItem = state.items.find((item) => item._id === _id);

        updatedItem.quantity = quantity;
        const index = state.items.findIndex((item) => item._id === _id);
        state.items[index] = updatedItem;
      });
  },
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
