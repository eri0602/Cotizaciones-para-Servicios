import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Proposal {
  id: string;
  price: number;
  message: string;
  status: string;
  createdAt: string;
  request: { id: string; title: string; category: { name: string } };
  provider: any;
}

interface ProposalsState {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
}

const initialState: ProposalsState = {
  proposals: [],
  loading: false,
  error: null,
};

export const fetchMyProposals = createAsyncThunk(
  'proposals/fetchMy',
  async (status?: string, { rejectWithValue }) => {
    try {
      const response = await api.get('/proposals/my-proposals', { params: { status } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar propuestas');
    }
  }
);

export const createProposal = createAsyncThunk(
  'proposals/create',
  async (data: { requestId: string; price: number; message: string; estimatedDays?: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/proposals', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al enviar propuesta');
    }
  }
);

export const withdrawProposal = createAsyncThunk(
  'proposals/withdraw',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/proposals/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al retirar propuesta');
    }
  }
);

const proposalSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProposals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload;
      })
      .addCase(fetchMyProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(withdrawProposal.fulfilled, (state, action) => {
        state.proposals = state.proposals.filter(p => p.id !== action.payload);
      });
  },
});

export default proposalSlice.reducer;
