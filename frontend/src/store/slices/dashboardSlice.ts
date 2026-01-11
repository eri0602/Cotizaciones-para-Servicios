import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface DashboardStats {
  clientRequests: number;
  receivedProposals: number;
  transactions: number;
  messages: number;
  providerProposals: number;
  activeJobs: number;
  availableRequests: number;
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    clientRequests: 0,
    receivedProposals: 0,
    transactions: 0,
    messages: 0,
    providerProposals: 0,
    activeJobs: 0,
    availableRequests: 0,
  },
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const [requests, transactions, proposals, conversations] = await Promise.all([
        api.get('/requests/my-requests'),
        api.get('/payments/transactions'),
        api.get('/proposals/my-proposals'),
        api.get('/chat/conversations'),
      ]);

      return {
        clientRequests: requests.data.data.length,
        receivedProposals: 0, // Would need separate API call
        transactions: transactions.data.data.length,
        messages: conversations.data.data.length,
        providerProposals: proposals.data.data.length,
        activeJobs: transactions.data.data.filter((t: any) => t.paymentStatus === 'PAID').length,
        availableRequests: 0, // Would need API for available requests
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar estadísticas');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
