import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Thunks cho các hành động async
export const fetchFoods = createAsyncThunk(
  "foods/fetchFoods",
  async ({ page, limit, sort }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const sortQuery = sort ? `&sort=${sort}` : "";
      const response = await baseApi.get(`/foods?page=${page}&limit=${limit}${sortQuery}`);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchDetailsFoods = createAsyncThunk(
  "foods/fetchDetailsFoods",
  async (foodId, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/foods/${foodId}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  foods: [],
  status: "idle",
  error: null,
  currentPage: 1,
  totalPages: 1,
  next: null,
  prev: null,
  food: {},
  foodToppings: [],
  isUpdated: false,
};

const foodSlice = createSlice({
  name: "foods",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoods.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.foods = action.payload.foods;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.error = null;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchDetailsFoods.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDetailsFoods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.food = action.payload;
        state.foodToppings = action.payload.toppings;
        state.error = null;
      })
      .addCase(fetchDetailsFoods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default foodSlice.reducer;
