import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchBanners = createAsyncThunk(
  "banners/fetchBanners",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(
        `/banners?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createBanner = createAsyncThunk(
  "banners/createBanner",
  async (newBanner, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/banners", newBanner, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateBanner = createAsyncThunk(
  "banners/updateBanner",
  async (updatedBanner, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(
        `/banners/${updatedBanner._id}`,
        updatedBanner,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteBanner = createAsyncThunk(
  "banners/deleteBanner",
  async (id, { rejectWithValue }) => {
    console.log(id);
    try {
      await baseApi.delete(`/banners/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const bannerSlice = createSlice({
  name: "banners",
  initialState: {
    banners: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    next: null,
    prev: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload.banners;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        if (state.banners.length == 0) {
          state.banners.push(action.payload.banner);
        }
        state.banners[0].show = action.payload.banner.show;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const index = state.banners.findIndex(
          (banner) => banner._id === action.payload.banner._id
        );
        state.banners[index].show = action.payload.banner.show;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter(
          (banner) => banner._id !== action.payload
        );
      })
      .addCase(deleteBanner.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError } = bannerSlice.actions;

export default bannerSlice.reducer;
