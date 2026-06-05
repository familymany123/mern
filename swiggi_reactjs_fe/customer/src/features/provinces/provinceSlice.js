import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchProvinces = createAsyncThunk(
  "provinces/fetchProvinces",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(
        `/provinces?page=${page}&limit=${limit}`
      );
      console.log(response.data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const provinceSlice = createSlice({
  name: "provinces",
  initialState: {
    provinces: [],
    loading: false,
    error: "",
    currentPage: 1,
    totalPage: 1,
    next: null,
    prev: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchProvinces.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProvinces.fulfilled, (state, action) => {
      state.provinces = action.payload.provinces;
      state.currentPage = action.payload.currentPage;
      state.totalPage = action.payload.totalPage;
      state.next = action.payload.next;
      state.prev = action.payload.prev;
      state.loading = false;
    });
    builder.addCase(fetchProvinces.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export default provinceSlice.reducer;
