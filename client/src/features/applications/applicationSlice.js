import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchMyApplications = createAsyncThunk(
  'applications/fetchMyApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/applications/my-applications');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch applications');
    }
  }
);

export const fetchJobApplicants = createAsyncThunk(
  'applications/fetchJobApplicants',
  async ({ jobId = 'all', status = 'all' }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/applications/job/${jobId}`, {
        params: { status },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch applicants');
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status, note }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/applications/${id}/status`, { status, note });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

export const assignInterviewers = createAsyncThunk(
  'applications/assignInterviewers',
  async ({ id, interviewerIds }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/applications/${id}/assign-interviewers`, {
        interviewerIds,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to assign interviewers');
    }
  }
);

const initialState = {
  myApplications: [],
  jobApplicants: [],
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplicationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Candidate Applications
      .addCase(fetchMyApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload.applications;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Recruiter Job Applicants
      .addCase(fetchJobApplicants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobApplicants.fulfilled, (state, action) => {
        state.loading = false;
        state.jobApplicants = action.payload.applications;
      })
      .addCase(fetchJobApplicants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Status
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const updated = action.payload.application;
        const index = state.jobApplicants.findIndex((app) => app._id === updated._id);
        if (index !== -1) {
          state.jobApplicants[index].status = updated.status;
          state.jobApplicants[index].statusHistory = updated.statusHistory;
        }
      });
  },
});

export const { clearApplicationError } = applicationSlice.actions;
export default applicationSlice.reducer;
