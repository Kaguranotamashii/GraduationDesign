import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// 启动 Vite 的命令
const viteCommand = 'vite --host';

// 启动 Vite 服务器并捕获日志
const viteProcess = exec(viteCommand);

// 清除 ANSI 转义序列的正则表达式
const removeAnsiCodes = (text) => {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
};

// 日志输出处理
viteProcess.stdout.on('data', (data) => {
    const logContent = data.toString();

    // 清理日志中的 ANSI 转义序列
    const cleanedLog = removeAnsiCodes(logContent);

    // 将清理后的日志写入文件
    fs.appendFileSync('vite-log.txt', cleanedLog);

    // 查找最后一个 Network: 地址
    const ipMatches = [...cleanedLog.matchAll(/Network:\s+https?:\/\/([\d.]+):\d+/g)];
    if (ipMatches.length > 0) {
        const lastIP = ipMatches[ipMatches.length - 1][1];
        const newUrl = `http://${lastIP}:8005`;

        // vite.config.js 文件路径
        const configFilePath = path.resolve('./vite.config.js');

        // 读取 vite.config.js 文件内容
        let configContent = fs.readFileSync(configFilePath, 'utf-8');

        // 替换 url 配置
        configContent = configContent.replace(/var url = '.*?'/, `var url = '${newUrl}'`);

        // 写入更新后的配置文件
        fs.writeFileSync(configFilePath, configContent, 'utf-8');

        console.log(`已更新 URL 为：${newUrl}`);
    }
});

// 错误输出处理
viteProcess.stderr.on('data', (data) => {
    const errorLog = data.toString();

    // 清理错误日志中的 ANSI 转义序列
    const cleanedErrorLog = removeAnsiCodes(errorLog);

    // 将清理后的错误日志写入文件
    fs.appendFileSync('vite-log.txt', cleanedErrorLog);

    console.error(`stderr: ${cleanedErrorLog}`);
});

// Vite 启动完毕时的回调
viteProcess.on('close', (code) => {
    if (code === 0) {
        console.log('Vite 服务器启动成功');
    } else {
        console.error(`Vite 启动失败，退出代码：${code}`);
    }
});
