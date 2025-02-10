//src/store/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = Boolean(action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      // 当设置用户信息时，如果有 token 也设置为已认证
      if (state.token && action.payload) {
        state.isAuthenticated = true;
      }
    },
    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    getUser: (state) => {
      return state.user;
    },
    getToken: (state) => {
      return state.token;
    },

  },
});

export const { setToken, setUser, clearAuth , getUser, getToken} = authSlice.actions;
export default authSlice.reducer;