import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async ({ rejectWithValue }) => {
    try {
      console.log(123);
      const response = await baseApi.get("/configs");
      console.log(123);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async ({ data, id }, { rejectWithValue }) => {
    try {
      console.log(data);
      const response = await baseApi.put(`/configs/${data._id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const settingSlice = createSlice({
  name: "settings",
  initialState: {
    settings: [],
    loading: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSettings.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchSettings.fulfilled, (state, action) => {
      state.settings = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchSettings.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(updateSettings.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      const index=state.settings.findIndex((setting)=>setting._id==action.payload.config._id);
      if (index !== -1) {
        state.settings[index]=action.payload.config
      }
      state.loading = false;
    });
    builder.addCase(updateSettings.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export default settingSlice.reducer;
