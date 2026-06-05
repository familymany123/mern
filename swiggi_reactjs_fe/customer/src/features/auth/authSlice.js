import { createSlice } from "@reduxjs/toolkit";
import { registerUser, userLogin } from "./authApiSlice";

// initialize userToken from local storage
const userToken = localStorage.getItem("accessToken")
  ? localStorage.getItem("accessToken")
  : null;

const initialState = {
  loading: false,
  userInfo: null,
  accessToken: userToken,
  error: null,
  success: false,
  registerSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("accessToken"); // delete token from storage
      state.loading = false;
      state.userInfo = null;
      state.accessToken = null;
      state.error = null;
      state.registerSuccess= false

    },
    setCredentials: (state, { payload }) => {
      state.userInfo = payload;
    },
    setToken: (state, { payload }) => {
      localStorage.setItem("accessToken", payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.accessToken = payload.accessToken;
        localStorage.setItem("accessToken", payload.accessToken); // save token to local storage
        localStorage.setItem("refreshToken", payload.refreshToken); // save token to local storage
        state.success = true;
      })
      .addCase(userLogin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.success = false;
      })
      // register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;  
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.registerSuccess = true;  
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.registerSuccess = false;  
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
