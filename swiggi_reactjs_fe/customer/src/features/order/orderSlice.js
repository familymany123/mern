import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(`/orders?page=${page}&limit=${limit}`);

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchDetailsOrder = createAsyncThunk(
  "orders/fetchDetailsOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/orders/${orderId}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/orders", data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async (data, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(`/orders/${data.id}`, data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);
export const completeDelivery = createAsyncThunk(
  "orders/completeDelivery",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await baseApi.patch(`/orders/${orderId}/delivered`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await baseApi.delete(`/orders/${orderId}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);
const initialState = {
  orders: [],
  status: "idle",
  error: null,
  currentPage: 1,
  totalPages: 1,
  next: null,
  prev: null,
  order: {}, // lưu thông tin chi tiết đơn hàng
  isUpdated: false,
};
export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await baseApi.patch(`/orders/${orderId}/cancel`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await baseApi.patch(`/orders/${orderId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrder(state) {
      state.status = "idle";
      state.error = null;
      console.log("reset");

    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.orders = action.payload.orders;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.error = null;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDetailsOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDetailsOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.order = action.payload; // Thông tin đơn hàng được cập nhật
        state.error = null;
      })
      .addCase(fetchDetailsOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.order = action.payload;
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.order = action.payload;
        state.error = null;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.order = action.payload;
        state.error = null;
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(cancelOrder.pending, (state) => {
        state.status = "loading";
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.orders.findIndex(
          (order) => order._id === action.payload.order._id
        );
        state.orders[index] = action.payload.order;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
  state.status = "loading";
})
.addCase(updateOrderStatus.fulfilled, (state, action) => {
  state.status = "succeeded";

  const index = state.orders.findIndex(
    (order) => order._id === action.payload.order._id
  );

  if (index !== -1) {
    state.orders[index] = action.payload.order;
  }

  state.order = action.payload;
  state.error = null;
})
.addCase(updateOrderStatus.rejected, (state, action) => {
  state.status = "failed";
  state.error = action.payload;
});
      
  },
});

export const { resetOrder } = orderSlice.actions;

export default orderSlice.reducer;
