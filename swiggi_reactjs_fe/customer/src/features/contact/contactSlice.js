import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(
        `/contacts?page=${page}&limit=${limit}`
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const createContact = createAsyncThunk(
  "contacts/createContact",
  async (data, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/contacts/", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const contactSlice = createSlice({
  name: "contacts",
  initialState: {
    contacts: [],
    loading: false,
    error: "",
    currentPage: 1,
    totalPage: 1,
    next: null,
    prev: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchContacts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchContacts.fulfilled, (state, action) => {
      state.contacts = action.payload.contacts;
      state.currentPage = action.payload.currentPage;
      state.totalPage = action.payload.totalPage;
      state.next = action.payload.next;
      state.prev = action.payload.prev;
      state.loading = false;
    });
    builder.addCase(fetchContacts.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export default contactSlice.reducer;
