import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, logoutUser } from '../api/user'; // 引入 API 调用方法

// 初始状态
const initialState = {
    isLoggedIn: false,
    username: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
};

// 异步操作：用户登录
export const userLogin = createAsyncThunk(
    'user/login',
    async (loginData, thunkAPI) => {
        try {
            const response = await loginUser(loginData); // 调用 API
            return response.data; // 返回成功的用户信息
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message); // 处理失败
        }
    }
);

// 异步操作：用户登出
export const userLogout = createAsyncThunk(
    'user/logout',
    async (_, thunkAPI) => {
        try {
            const response = await logoutUser(); // 调用 API
            return response.data; // 返回成功消息
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message); // 处理失败
        }
    }
);

// 创建用户 Slice
const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        // 同步操作：登录
        login(state, action) {
            state.isLoggedIn = true;
            state.username = action.payload.username;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
        },
        // 同步操作：登出
        logout(state) {
            state.isLoggedIn = false;
            state.username = null;
            state.accessToken = null;
            state.refreshToken = null;
        },
    },
    extraReducers: (builder) => {
        // 处理异步登录请求
        builder.addCase(userLogin.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(userLogin.fulfilled, (state, action) => {
            state.loading = false;
            state.isLoggedIn = true;
            state.username = action.payload.username;
            state.accessToken = action.payload.access;
            state.refreshToken = action.payload.refresh;
        });
        builder.addCase(userLogin.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // 处理异步登出请求
        builder.addCase(userLogout.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(userLogout.fulfilled, (state) => {
            state.loading = false;
            state.isLoggedIn = false;
            state.username = null;
            state.accessToken = null;
            state.refreshToken = null;
        });
        builder.addCase(userLogout.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

// 导出同步 Actions
export const { login, logout } = userSlice.actions;

// 导出 Reducer
export default userSlice.reducer;
