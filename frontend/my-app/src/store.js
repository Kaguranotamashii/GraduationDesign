import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // 使用 localStorage 作为默认存储引擎
import { combineReducers } from 'redux';
import userReducer from './tools/userSlice';

// 配置持久化
const persistConfig = {
    key: 'root',
    storage,
};

// 合并多个 Reducer（目前只有 user）
const rootReducer = combineReducers({
    user: userReducer,
});

// 持久化处理
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建 Redux Store
const store = configureStore({
    reducer: persistedReducer,
});

// 持久化 Store
export const persistor = persistStore(store);
export default store;
