import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import baseApi from '../../api/baseApi';

export const fetchCurrentOrderCount = createAsyncThunk('currentOrder/fetch', async () => {
  const response = await baseApi.get('/statistics/current_order_count');
  console.log(response.data);
  return response.data;
});

const currentOrderSlice = createSlice({
  name: 'currentOrder',
  initialState: { dailyOrders: 0, weeklyOrders: 0, monthlyOrders: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentOrderCount.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default currentOrderSlice.reducer;
