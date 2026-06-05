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
  
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const createProvince = createAsyncThunk(
  "provinces/createProvince",
  async (newProvince, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/provinces", newProvince);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateProvince = createAsyncThunk(
  "provinces/updateProvince",
  async (updatedProvince, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(
        `/provinces/${updatedProvince._id}`,
        updatedProvince
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteProvince = createAsyncThunk(
  "provinces/deleteProvince",
  async (data, { rejectWithValue }) => {
    console.log(data);
    try {
      await baseApi.delete(`/provinces/${data._id}`);
      return data._id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
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
    builder.addCase(createProvince.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createProvince.fulfilled, (state, action) => {
      state.provinces.push(action.payload.province);
      state.loading = false;
    });
    builder.addCase(createProvince.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(updateProvince.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateProvince.fulfilled, (state, action) => {
      const newProvinces = state.provinces.map((province) =>
        province._id === action.payload._id ? action.payload : province
      );
      state.provinces = newProvinces;
      state.loading = false;
    });
    builder.addCase(updateProvince.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(deleteProvince.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteProvince.fulfilled, (state, action) => {
      state.provinces = state.provinces.filter(
        (province) => province._id !== action.payload
      );
      state.loading = false;
    });
    builder.addCase(deleteProvince.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export default provinceSlice.reducer;