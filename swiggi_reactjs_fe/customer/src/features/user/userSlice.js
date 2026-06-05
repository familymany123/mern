import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";
export const userProfile = createAsyncThunk(
  "user/userProfile",
  async ({ rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/users/profile`);
      console.log(response.data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const userUpdate = createAsyncThunk(
  "user/userUpdate",
  async ({ data, rejectWithValue }) => {
    try {
      const response = await baseApi.put(`/users/`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("userToken"); // delete token from storage
      state.loading = false;
      state.userInfo = null;
      state.userToken = null;
      state.error = null;
    },
    setCredentials: (state, { payload }) => {
      state.userInfo = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userProfile.pending, (state) => {
        // Show loading indicator
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(userProfile.rejected, (state, action) => {
        // Show error message
        state.error = action.payload;
        state.isLoggedIn = false;
        state.loading = false;
      })
      .addCase(userUpdate.pending, (state) => {
        // Show loading indicator
        state.loading = true;
        state.error = null;
      })
      .addCase(userUpdate.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isLoggedIn = true;
        state.loading = false;
      })
      .addCase(userUpdate.rejected, (state, action) => {
        // Show error message
        state.error = action.payload;
        state.isLoggedIn = false;
        state.loading = false;
      });
  },
});
export const { logout, setCredentials } = userSlice.actions;

export default userSlice.reducer;
