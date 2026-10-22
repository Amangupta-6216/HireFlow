import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/register', formData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await axiosClient.post('/auth/logout');
  } catch (err) {
    // Ignore error
  }
  return true;
});

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get('/auth/me');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Session expired');
    }
  }
);

const initialState = {
  user: null,
  accessToken: null,
  company: null,
  isAuthenticated: false,
  loading: false,
  initialChecking: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    tokenRefreshed: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) state.user = action.payload.user;
      if (action.payload.company !== undefined) state.company = action.payload.company;
      state.isAuthenticated = true;
    },
    logoutAction: (state) => {
      state.user = null;
      state.accessToken = null;
      state.company = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.company = action.payload.company;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.company = null;
        state.isAuthenticated = false;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.initialChecking = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.initialChecking = false;
        state.user = action.payload.user;
        state.company = action.payload.company;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.initialChecking = false;
        state.user = null;
        state.accessToken = null;
        state.company = null;
        state.isAuthenticated = false;
      });
  },
});

export const { tokenRefreshed, logoutAction, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
