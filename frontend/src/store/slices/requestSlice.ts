import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Request {
  id: string;
  title: string;
  description: string;
  category: { id: string; name: string };
  budgetMin: number | null;
  budgetMax: number | null;
  city: string;
  state: string;
  urgency: string;
  status: string;
  proposalsCount: number;
  viewsCount: number;
  createdAt: string;
}

interface RequestsState {
  requests: Request[];
  currentRequest: Request | null;
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

const initialState: RequestsState = {
  requests: [],
  currentRequest: null,
  total: 0,
  page: 1,
  pages: 0,
  loading: false,
  error: null,
};

export const fetchRequests = createAsyncThunk(
  'requests/fetchAll',
  async (params?: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar solicitudes');
    }
  }
);

export const fetchRequestById = createAsyncThunk(
  'requests/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/requests/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar solicitud');
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'requests/fetchMy',
  async (status?: string, { rejectWithValue }) => {
    try {
      const response = await api.get('/requests/my-requests', { params: { status } });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar solicitudes');
    }
  }
);

export const createRequest = createAsyncThunk(
  'requests/create',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post('/requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear solicitud');
    }
  }
);

const requestSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.currentRequest = action.payload;
      })
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.requests.unshift(action.payload);
      });
  },
});

export const { clearCurrentRequest, clearError } = requestSlice.actions;
export default requestSlice.reducer;
