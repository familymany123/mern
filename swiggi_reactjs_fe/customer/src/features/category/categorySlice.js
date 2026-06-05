import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

// Async thunk to fetch categories
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(
        `/categories?page=${page}&limit=${limit}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
// fetch food by category
export const fetchFoodByCategory = createAsyncThunk(
  "categories/fetchFoodByCategory",
  async ({ id, page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(
        `/categories/${id}/foods?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// fetch category by id
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async ({ id, page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(`/categories/${id}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    categories: [],
    status: "idle",
    error: null,
    currentPage: 1,
    totalPages: 1,
    next: null,
    prev: null,
    foodByCategory: [],
    category: {},
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = [];
        state.categories = action.payload.categories;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchFoodByCategory.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFoodByCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.foodByCategory = action.payload.foods;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.error = null;
      })
      .addCase(fetchFoodByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCategoryById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.category = action.payload;
        state.error = null;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
