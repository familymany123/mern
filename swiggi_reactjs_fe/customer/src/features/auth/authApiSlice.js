import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import baseApi from "../../api/baseApi";

export const userLogin = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await baseApi.post(`/login`, {
        username,
        password,
      });

      // store user's token in local storage
      localStorage.setItem("accessToken", data.accessToken);
      return data;
    } catch (error) {
       toast.error(error.response.data.message);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      await baseApi.post(`/register`,data);
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

