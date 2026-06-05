import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(`/users?page=${page}&limit=${limit}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (newUser, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/users", newUser);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (updatedUser, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(`/users/${updatedUser}`, updatedUser);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await baseApi.delete(`/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const blockUser = createAsyncThunk(
  "users/blockUser",
  async (id, { rejectWithValue }) => {
    try {
      console.log(id);
      const { data } = await baseApi.patch(`/users/${id}/block`);
      console.log(data);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  users: [],
  status: null,
  error: null,
  currentPage: 1,
  totalPages: 1,
  next: null,
  prev: null,
  user: {},
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.status = "success";
      state.users = action.payload.users;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.next = action.payload.next;
      state.prev = action.payload.prev;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
    builder.addCase(createUser.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      state.status = "success";
      state.users.push(action.payload.user);
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      console.log(action.payload);
      const { _id } = action.payload.user;
      let existingUser = state.users.find((user) => user._id === _id);
      if (existingUser) {
        existingUser = action.payload.user;
      }
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.error = action.payload.message;
      state.status = "failed";
    });
    builder.addCase(deleteUser.fulfilled, (state, action) => {
      const id = action.payload;
      state.users = state.users.filter((user) => user._id !== id);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.error = action.payload;
      state.status = "failed";
    });
    builder.addCase(blockUser.fulfilled, (state, action) => {
      const id = action.payload;
      const user = state.users.find((user) => user._id === id);
      user.status = !user.status;
    });
    builder
      .addCase(blockUser.rejected, (state, action) => {
        state.error = action.payload;
        state.status = "failed";
      })
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload;
      });
  },
});

export default userSlice.reducer;
