import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import jobReducer from './features/jobs/jobSlice';
import applicationReducer from './features/applications/applicationSlice';
import companyReducer from './features/company/companySlice';
import adminReducer from './features/admin/adminSlice';
import { injectStore } from './api/axiosClient';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    jobs: jobReducer,
    applications: applicationReducer,
    company: companyReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Inject store into Axios client for token refresh synchronization
injectStore(store);

export default store;
