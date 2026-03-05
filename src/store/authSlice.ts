import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
      state.isInitialized = true;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setInitialized(state) {
      state.isInitialized = true;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export const { setUser, setLoading, setInitialized, logout } = authSlice.actions;
export default authSlice.reducer;
