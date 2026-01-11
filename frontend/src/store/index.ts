import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import requestReducer from './slices/requestSlice';
import proposalReducer from './slices/proposalSlice';
import chatReducer from './slices/chatSlice';
import dashboardReducer from './slices/dashboardSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    requests: requestReducer,
    proposals: proposalReducer,
    chat: chatReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
