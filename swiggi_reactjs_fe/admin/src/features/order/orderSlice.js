import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchOrder = createAsyncThunk(
  "order/fetchOrder",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      console.log(page);
      const response = await baseApi.get(`/orders?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchOrderDetail = createAsyncThunk(
  "order/fetchOrderDetail",
  async ( id , { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateOrderStatus = createAsyncThunk(
  "order/updateStatus",
  async ({ orderId, status }) => {
    const response = await baseApi.patch(`/orders/${orderId}/status`, {
      status,
    });
    console.log(response.data);
    return response.data.order;
  }
);

export const cancelOrder = createAsyncThunk(
  "order/cancelOrder",
  async ({ orderId }, { rejectWithValue }) => {
    try {
      const response = await baseApi.patch(`/orders/${orderId}/cancel`);
      return response.data.order;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    loading: false,
    error: "",
    currentPage: 1,
    totalPages: 1,
    next: null,
    prev: null,
    order: {},
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.loading = false;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
        }
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex(
          (order) => order._id === action.payload._id
        );
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
        }
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.order = action.payload;
      });
  },
});

export default orderSlice.reducer;
