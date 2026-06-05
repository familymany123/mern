import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import baseApi from "../../api/baseApi";

const toFoodFormData = (food) => {
  const formData = new FormData();

  Object.entries(food).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (key === "category" && typeof value === "object") {
      formData.append(key, value._id || "");
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

// Thunks cho các hành động async
export const fetchFoods = createAsyncThunk(
  "foods/fetchFoods",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      if (!page) {
        page = 1;
      }
      if (!limit) {
        limit = 10;
      }
      const response = await baseApi.get(`/foods?page=${page}&limit=${limit}`);

      console.log(response.data);
      return response.data;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error.response.data);
    }
  }
);

export const createFood = createAsyncThunk(
  "foods/createFood",
  async (newFood, { rejectWithValue }) => {
    try {
      console.log(newFood);
      const response = await baseApi.post("/foods", toFoodFormData(newFood), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateFood = createAsyncThunk(
  "foods/updateFood",
  async (updatedFood, { rejectWithValue }) => {
    try {
      const formData = toFoodFormData(updatedFood);
      const response = await baseApi.put(
        `/foods/${updatedFood._id}`,
        formData,
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

export const deleteFood = createAsyncThunk(
  "foods/deleteFood",
  async (id, { rejectWithValue }) => {
    try {
      await baseApi.delete(`/foods/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFoodById = createAsyncThunk(
  "foods/fetchFoodById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/foods/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const addToppingToFood = createAsyncThunk(
  "foods/addToppingToFood",
  async ({ foodId, toppingId }, { rejectWithValue }) => {
    try {
      const response = await baseApi.post(`/foods/topping`, {
        food: foodId,
        topping: toppingId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);
export const removeToppingFromFood = createAsyncThunk(
  "foods/removeToppingFromFood",
  async (foodToDelete, { rejectWithValue }) => {
    try {
      console.log(foodToDelete);
      await baseApi.delete(`/foods/topping/${foodToDelete}`);
      return foodToDelete;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchFoodToppings = createAsyncThunk(
  "foods/fetchFoodToppings",
  async (id, { rejectWithValue }) => {
    try {
      const response = await baseApi.get(`/foods/topping/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  foods: [],
  status: "idle",
  error: null,
  currentPage: 1,
  totalPages: 1,
  next: null,
  prev: null,
  food: {},
  foodToppings: [],
  isUpdated: false,
};

const foodSlice = createSlice({
  name: "foods",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoods.pending, (state, action) => {
        state.status = "loading";
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.foods = action.payload.foods;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.next = action.payload.next;
        state.prev = action.payload.prev;
        state.error = null;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createFood.fulfilled, (state, action) => {
        state.foods.push(action.payload.food);
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(createFood.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      })
      .addCase(updateFood.fulfilled, (state, action) => {
        const index = state.foods.findIndex(
          (food) => food._id === action.payload.food._id
        );
        if (index !== -1) {
          state.foods[index] = action.payload.food;
        }
      })
      .addCase(deleteFood.fulfilled, (state, action) => {
        state.foods = state.foods.filter((food) => food._id !== action.payload);
      })
      .addCase(fetchFoodById.fulfilled, (state, action) => {
        state.food = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchFoodById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      })
      .addCase(addToppingToFood.fulfilled, (state, action) => {
        state.isUpdated = !state.isUpdated;
      })
      .addCase(addToppingToFood.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      })
      .addCase(fetchFoodToppings.pending, (state, action) => {
        state.status = "loading";
        state.foodToppings= [];
      })
      .addCase(fetchFoodToppings.fulfilled, (state, action) => {
        state.foodToppings = action.payload;
        console.log(action.payload);
      })
      .addCase(fetchFoodToppings.rejected, (state, action) => {
        state.status = "failed";
        state.foodToppings= [];
        state.error = action.payload.message;
      })
      .addCase(removeToppingFromFood.fulfilled, (state, action) => {
        state.foodToppings = state.foodToppings.filter(
          (foodTopping) => foodTopping._id !== action.payload
        );
      })
      .addCase(removeToppingFromFood.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      });
  },
});

export default foodSlice.reducer;
