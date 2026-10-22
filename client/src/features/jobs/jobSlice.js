import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/jobs', { params });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/jobs/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch job details');
    }
  }
);

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/jobs', jobData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create job');
    }
  }
);

export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update job');
    }
  }
);

export const closeJob = createAsyncThunk(
  'jobs/closeJob',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/jobs/${id}/close`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to close job');
    }
  }
);

export const applyToJob = createAsyncThunk(
  'jobs/applyToJob',
  async ({ jobId, coverLetter }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/jobs/${jobId}/apply`, { coverLetter });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit application');
    }
  }
);

export const toggleSaveJob = createAsyncThunk(
  'jobs/toggleSaveJob',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post(`/profile/save-job/${jobId}`);
      return { jobId, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to bookmark job');
    }
  }
);

const initialState = {
  jobs: [],
  currentJob: null,
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  },
  filters: {
    keyword: '',
    location: '',
    jobType: 'all',
    experienceLevel: 'all',
    isRemote: false,
    minSalary: '',
    maxSalary: '',
    sortBy: 'newest',
  },
  savedJobIds: [],
  appliedJobIds: [],
  loading: false,
  error: null,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.job;
        if (action.payload.hasApplied && !state.appliedJobIds.includes(action.payload.job._id)) {
          state.appliedJobIds.push(action.payload.job._id);
        }
        if (action.payload.isSaved && !state.savedJobIds.includes(action.payload.job._id)) {
          state.savedJobIds.push(action.payload.job._id);
        }
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Apply to Job
      .addCase(applyToJob.fulfilled, (state, action) => {
        const jobId = action.payload.application.job;
        if (!state.appliedJobIds.includes(jobId)) {
          state.appliedJobIds.push(jobId);
        }
        if (state.currentJob && state.currentJob._id === jobId) {
          state.currentJob.applicantsCount = (state.currentJob.applicantsCount || 0) + 1;
        }
      })
      // Toggle Save
      .addCase(toggleSaveJob.fulfilled, (state, action) => {
        const { jobId, isSaved } = action.payload;
        if (isSaved) {
          if (!state.savedJobIds.includes(jobId)) state.savedJobIds.push(jobId);
        } else {
          state.savedJobIds = state.savedJobIds.filter((id) => id !== jobId);
        }
      });
  },
});

export const { setFilters, resetFilters, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
