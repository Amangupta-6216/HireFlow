import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchMyCompany = createAsyncThunk(
  'company/fetchMyCompany',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/company/my-company');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch company profile');
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  'company/updateCompanyProfile',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put('/company/profile', companyData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update company');
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'company/fetchTeamMembers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/company/members');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch team members');
    }
  }
);

export const inviteTeamMember = createAsyncThunk(
  'company/inviteTeamMember',
  async ({ email, companyRole }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/company/invite', { email, companyRole });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send invite');
    }
  }
);

export const updateMemberRole = createAsyncThunk(
  'company/updateMemberRole',
  async ({ memberId, companyRole }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/company/members/${memberId}/role`, { companyRole });
      return { memberId, companyRole, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update member role');
    }
  }
);

export const removeMember = createAsyncThunk(
  'company/removeMember',
  async (memberId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/company/members/${memberId}`);
      return memberId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to remove member');
    }
  }
);

const initialState = {
  company: null,
  role: null,
  members: [],
  pendingInvites: [],
  loading: false,
  error: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch My Company
      .addCase(fetchMyCompany.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload.company;
        state.role = action.payload.role;
      })
      .addCase(fetchMyCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Company
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.company = action.payload.company;
      })
      // Team Members
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.members = action.payload.members;
        state.pendingInvites = action.payload.pendingInvites;
      })
      // Remove Member
      .addCase(removeMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m._id !== action.payload);
      });
  },
});

export default companySlice.reducer;
