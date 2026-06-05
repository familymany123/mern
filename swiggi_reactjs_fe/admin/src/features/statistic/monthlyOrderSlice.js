import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import baseApi from '../../api/baseApi';

export const fetchMonthlyOrderCount = createAsyncThunk('monthlyOrder/fetch', async () => {
  const response = await baseApi.get('/statistics/monthly_order_count');
  return response.data;
});

const monthlyOrderSlice = createSlice({
  name: 'monthlyOrder',
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMonthlyOrderCount.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export default monthlyOrderSlice.reducer;
