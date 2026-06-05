import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import baseApi from '../../api/baseApi';

export const fetchCurrentRevenue = createAsyncThunk('currentRevenue/fetch', async () => {
  const response = await baseApi.get('/statistics/current_revenue');
  return response.data;
});

const currentRevenueSlice = createSlice({
  name: 'currentRevenue',
  initialState: { dailyRevenue: 0, weeklyRevenue: 0, monthlyRevenue: 0 },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCurrentRevenue.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default currentRevenueSlice.reducer;
