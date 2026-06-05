import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Async thunk to fetch coupons
export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      console.log("hihi");
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 100;
      }
      const response = await baseApi.get(
        `/coupons?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchCouponById = createAsyncThunk(
  "coupons/fetchCouponById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const couponSlice = createSlice({
  name: "coupons",
  initialState: {
    coupons: [],
    coupon: null,
    status: "idle",
    error: null,
    currentPage: 1,
    totalPages: 1,
    next: null,
    prev: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coupons = action.payload.coupons;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCouponById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coupon = action.payload;
      })
      .addCase(fetchCouponById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default couponSlice.reducer;
