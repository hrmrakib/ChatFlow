import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginResponse } from '../../types';
import { api } from '../../services/api';
import { socketService } from '../../services/socket';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY_TOKEN = 'chatflow_token';
const STORAGE_KEY_USER = 'chatflow_user';

function getInitialAuth(): { token: string | null; user: User | null } {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    const user = userStr ? JSON.parse(userStr) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

const initial = getInitialAuth();

const initialState: AuthState = {
  user: initial.user,
  token: initial.token,
  isLoading: false,
  error: null,
};

export const loginUser = createAsyncThunk<LoginResponse, { phone: string; name: string }>(
  'auth/loginUser',
  async ({ phone, name }, { rejectWithValue }) => {
    try {
      const response = await api.auth.login(phone.trim(), name.trim());
      localStorage.setItem(STORAGE_KEY_TOKEN, response.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(response.user));
      // Connect socket on login
      socketService.connect(response.token);
      return response;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const restoreSession = createAsyncThunk<User, void, { state: { auth: AuthState } }>(
  'auth/restoreSession',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) {
      return rejectWithValue('No token found');
    }
    try {
      const user = await api.auth.me(token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      socketService.connect(token);
      return user;
    } catch (err: unknown) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      const msg = err instanceof Error ? err.message : 'Session expired';
      return rejectWithValue(msg);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
    },
    clearAuthError(state) {
      state.error = null;
    },
    setMockUser(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem(STORAGE_KEY_TOKEN, action.payload.token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload.user));
    },
  },
  
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      // restoreSession
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearAuthError, setMockUser } = authSlice.actions;
export default authSlice.reducer;
