import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'antd/dist/reset.css';

import { Provider } from 'react-redux'; // 引入 Redux Provider
import store, { persistor } from './store'; // 引入 Redux Store 和 Persistor
import { PersistGate } from 'redux-persist/integration/react'; // 引入 PersistGate，用于持久化处理

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        {/* 包裹 Provider 提供全局 Redux 状态 */}
        <Provider store={store}>
            {/* PersistGate 确保在状态恢复后再渲染 App */}
            <PersistGate loading={null} persistor={persistor}>
                <App />
            </PersistGate>
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
