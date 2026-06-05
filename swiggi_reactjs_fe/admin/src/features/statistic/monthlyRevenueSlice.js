import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import baseApi from '../../api/baseApi';

// Async Thunk để lấy dữ liệu từ API
export const fetchMonthlyRevenue = createAsyncThunk('monthlyRevenue/fetch', async () => {
  const response = await baseApi.get('/statistics/monthly_revenue');
  return response.data;
});

const monthlyRevenueSlice = createSlice({
  name: 'monthlyRevenue',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMonthlyRevenue.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default monthlyRevenueSlice.reducer;
