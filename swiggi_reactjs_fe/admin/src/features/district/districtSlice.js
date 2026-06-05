import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchDistrict = createAsyncThunk(
  "district/fetchDistrict",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(
        `/districts?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createDistrict = createAsyncThunk(
  "district/createDistrict",
  async (newDistrict, { rejectWithValue }) => {
    try {
      console.log(newDistrict)
      const response = await baseApi.post("/districts", newDistrict);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateDistrict = createAsyncThunk(
  "district/updateDistrict",
  async (updatedDistrict, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(
        `/districts/${updatedDistrict.id}`,
        updatedDistrict
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteDistrict = createAsyncThunk(
  "district/deleteDistrict",
  async (data, { rejectWithValue }) => {
    try {
      console.log(data)
      await baseApi.delete(`/districts/${data._id}`);
      return data._id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const districtSlice = createSlice({
  name: "district",
  initialState: {
    districts: [],
    loading: false,
    error: "",
    currentPage: 1,
    totalPages: 1,
    next: null,
    prev: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDistrict.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDistrict.fulfilled, (state, action) => {
        state.districts = action.payload.districts;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.loading = false;
      })
      .addCase(fetchDistrict.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createDistrict.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDistrict.fulfilled, (state, action) => {
        state.districts.push(action.payload.district);
        state.loading = false;
      })
      .addCase(createDistrict.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateDistrict.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDistrict.fulfilled, (state, action) => {
        const newDistricts = state.districts.map((district) =>
          district._id === action.payload._id ? action.payload : district
        );
        state.districts = newDistricts;
        state.loading = false;
      })
      .addCase(updateDistrict.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(deleteDistrict.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteDistrict.fulfilled, (state, action) => {
        state.districts = state.districts.filter(
          (district) => district._id !== action.payload
        );
        state.loading = false;
      })
      .addCase(deleteDistrict.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export default districtSlice.reducer;