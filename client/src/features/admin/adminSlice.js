import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/stats');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch platform stats');
    }
  }
);

export const fetchAdminCompanies = createAsyncThunk(
  'admin/fetchAdminCompanies',
  async (status = 'all', { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/companies', { params: { status } });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch companies');
    }
  }
);

export const updateCompanyStatus = createAsyncThunk(
  'admin/updateCompanyStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/admin/companies/${id}/status`, { status });
      return { id, status, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update company status');
    }
  }
);

export const fetchAdminJobs = createAsyncThunk(
  'admin/fetchAdminJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/admin/jobs', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const deleteJobAdmin = createAsyncThunk(
  'admin/deleteJobAdmin',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/admin/jobs/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete job');
    }
  }
);

const initialState = {
  stats: null,
  companies: [],
  jobs: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Companies
      .addCase(fetchAdminCompanies.fulfilled, (state, action) => {
        state.companies = action.payload.companies;
      })
      // Update Company Status
      .addCase(updateCompanyStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const index = state.companies.findIndex((c) => c._id === id);
        if (index !== -1) {
          state.companies[index].verifiedStatus = status;
        }
      })
      // Jobs
      .addCase(fetchAdminJobs.fulfilled, (state, action) => {
        state.jobs = action.payload.jobs;
      })
      // Delete Job
      .addCase(deleteJobAdmin.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((j) => j._id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
