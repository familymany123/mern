import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Async thunk to fetch coupons
export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(
        `/coupons?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to create a new coupon
export const createCoupon = createAsyncThunk(
  "coupons/createCoupon",
  async (newCoupon, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/coupons", newCoupon);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to update a coupon
export const updateCoupon = createAsyncThunk(
  "coupons/updateCoupon",
  async (updatedCoupon, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(
        `/coupons/${updatedCoupon._id}`,
        updatedCoupon
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Async thunk to delete a coupon
export const deleteCoupon = createAsyncThunk(
  "coupons/deleteCoupon",
  async (id, { rejectWithValue }) => {
    console.log(id);
    try {
      await baseApi.delete(`/coupons/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const couponSlice = createSlice({
  name: "coupons",
  initialState: {
    coupons: [],
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
      .addCase(createCoupon.fulfilled, (state, action) => {
       
        state.coupons.push(action.payload.coupon);
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        console.log(action.payload);
        const index = state.coupons.findIndex(
          (coupon) => coupon._id === action.payload.coupon._id
        );
        if (index !== -1) {
          state.coupons[index] = action.payload.coupon;
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(
          (coupon) => coupon._id !== action.payload
        );
      });
  },
});

export default couponSlice.reducer;
