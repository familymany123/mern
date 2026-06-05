import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

export const fetchToppings = createAsyncThunk(
  "toppings/fetchToppings",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(`/toppings?page=${page}&limit=${limit}`);

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);
export const createTopping = createAsyncThunk(
  "toppings/createTopping",
  async (newTopping, { rejectWithValue }) => {
    try {
      const response = await baseApi.post("/toppings", newTopping);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateTopping = createAsyncThunk(
  "toppings/updateTopping",
  async (updatedTopping, { rejectWithValue }) => {
    try {
      const response = await baseApi.put(
        `/toppings/${updatedTopping._id}`,
        updatedTopping
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteTopping = createAsyncThunk(
  "toppings/deleteTopping",
  async (id, { rejectWithValue }) => {
    try {
      await baseApi.delete(`/toppings/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const fetchToppingById = createAsyncThunk(
  "toppings/fetchToppingById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/toppings/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  toppings: [],
  status: "idle",
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  next: null,
  prev: null,
  topping: {},
};

const toppingSlice = createSlice({
  name: "toppings",
  initialState,
  reducers: {
    resetTopping: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchToppings.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchToppings.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.toppings = action.payload.toppings;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.next = action.payload.next;
      state.prev = action.payload.prev;
    });
    builder.addCase(fetchToppings.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    });
    builder.addCase(createTopping.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createTopping.fulfilled, (state, action) => {
      state.loading = false;
      state.toppings.push(action.payload.topping);
    });
    builder.addCase(createTopping.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(updateTopping.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateTopping.fulfilled, (state, action) => {
      state.loading = false;
      state.status = "succeeded";
      const index = state.toppings.findIndex(
        (topping) => topping._id === action.payload.topping._id
      );
      if (index !== -1) {
        state.toppings[index] = action.payload.topping;
      }
    });
    builder.addCase(updateTopping.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(deleteTopping.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(deleteTopping.fulfilled, (state, action) => {
      state.loading = false;
      state.toppings = state.toppings.filter(
        (topping) => topping._id !== action.payload
      );
    });
    builder.addCase(deleteTopping.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase(fetchToppingById.pending, (state) => {
      state.status = "loading";
    }
    )
    .addCase(fetchToppingById.fulfilled, (state, action) => {
      state.status = "succeeded";
      state.topping = action.payload.topping;
    })
    .addCase(fetchToppingById.rejected, (state, action) => {
      state.status = "failed";
      state.toppings = {};
      state.error = action.payload
    }
    );
  },
});
export const { resetTopping } = toppingSlice.actions;
export default toppingSlice.reducer;