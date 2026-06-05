import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const submitRating = createAsyncThunk(
  "ratings/submitRating",
  async (data, { rejectWithValue }) => {
    try {
      const response = await baseApi.post(`/reviews`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchRatings = createAsyncThunk(
  "ratings/fetchRatings",
  async (productId, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/reviews/${productId}/food`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const ratingSlice = createSlice({
  name: "ratings",
  initialState: {
    ratings: [],
    status: "idle",
    avgStar: 0,
    error: null,
    totalReviews: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitRating.pending, (state) => {
        state.status = "loading";
      })
      .addCase(submitRating.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(submitRating.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchRatings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ratings = action.payload.reviews;
        state.avgStar = action.payload.avgStar;
        state.totalReviews = action.payload.totalReviews;
        state.error = null;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default ratingSlice.reducer;
