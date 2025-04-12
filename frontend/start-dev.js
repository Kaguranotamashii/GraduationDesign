import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 控制是否启动 Django 后端
const START_DJANGO = false; // 设置为 true 同时启动 Django 和 Vite，设置为 false 只启动 Vite

// 启动 Vite 的命令
const viteCommand = 'vite --host';
// 启动 Django 后端的命令
const djangoCommand = 'python manage.py runserver_plus 0.0.0.0:8005 --cert-file cert.pem --key-file key.pem';

// 启动 Vite 服务器
const viteProcess = exec(viteCommand, { cwd: path.resolve(__dirname) }); // 前端目录

// 根据 START_DJANGO 决定是否启动 Django 服务器
let djangoProcess;
if (START_DJANGO) {
    djangoProcess = exec(djangoCommand, { cwd: path.resolve('G:/GraduationDesign/probject/backend') }); // 后端目录
}

// 清除 ANSI 转义序列的正则表达式
const removeAnsiCodes = (text) => {
    return text.replace(/\x1b\[[0-9;]*m/g, '');
};

// 处理 Vite 日志
viteProcess.stdout.on('data', (data) => {
    const logContent = data.toString();
    const cleanedLog = removeAnsiCodes(logContent);

    // 将日志写入文件
    fs.appendFileSync('vite-log.txt', cleanedLog);

    // 查找最后一个 Network: 地址
    const ipMatches = [...cleanedLog.matchAll(/Network:\s+https?:\/\/([\d.]+):\d+/g)];
    if (ipMatches.length > 0) {
        const lastIP = ipMatches[ipMatches.length - 1][1];
        const newUrl = `https://${lastIP}:8005`; // 后端固定使用 8005 端口

        // 1. 更新 vite.config.js
        const viteConfigFilePath = path.resolve(__dirname, './vite.config.js');
        let viteConfigContent = fs.readFileSync(viteConfigFilePath, 'utf-8');
        viteConfigContent = viteConfigContent.replace(/var url = '.*?'/, `var url = '${newUrl}'`);
        fs.writeFileSync(viteConfigFilePath, viteConfigContent, 'utf-8');

        // 2. 更新 Django settings.py（无论 START_DJANGO 是 true 还是 false 都执行）
        const settingsFilePath = path.resolve('G:/GraduationDesign/probject/backend/probject/settings.py');
        if (fs.existsSync(settingsFilePath)) {
            let settingsContent = fs.readFileSync(settingsFilePath, 'utf-8');
            const urlBasePattern = /URL_BASE\s*=\s*['"]https?:\/\/[\d.]+:8005['"]/;
            if (settingsContent.match(urlBasePattern)) {
                settingsContent = settingsContent.replace(urlBasePattern, `URL_BASE = '${newUrl}'`);
                fs.writeFileSync(settingsFilePath, settingsContent, 'utf-8');
                console.log(`已更新 settings.py 中的 URL_BASE 为：${newUrl}`);

                // 如果 START_DJANGO 为 true，重启 Django 服务
                if (START_DJANGO && djangoProcess) {
                    djangoProcess.kill();
                    setTimeout(() => {
                        djangoProcess = exec(djangoCommand, { cwd: path.resolve('G:/GraduationDesign/probject/backend') });
                        handleDjangoOutput(djangoProcess);
                    }, 1000);
                }
            } else {
                console.warn('settings.py 中未找到 URL_BASE 配置，未进行更新');
            }
        } else {
            console.error(`未找到 settings.py 文件：${settingsFilePath}`);
        }

        console.log(cleanedLog);
        console.log(`已更新 vite.config.js 中的 URL 为：${newUrl}`);
    }
});

// 处理 Django 输出
function handleDjangoOutput(process) {
    process.stdout.on('data', (data) => {
        const cleanedLog = removeAnsiCodes(data.toString());
        fs.appendFileSync('django-log.txt', cleanedLog);
        console.log(`Django stdout: ${cleanedLog}`);
    });

    process.stderr.on('data', (data) => {
        const cleanedErrorLog = removeAnsiCodes(data.toString());
        fs.appendFileSync('django-log.txt', cleanedErrorLog);
        console.error(`Django stderr: ${cleanedErrorLog}`);
    });

    process.on('close', (code) => {
        console.log(`Django 进程退出，代码：${code}`);
    });
}

// 如果 START_DJANGO 为 true，则绑定 Django 输出
if (START_DJANGO && djangoProcess) {
    handleDjangoOutput(djangoProcess);
}

// Vite 错误输出处理
viteProcess.stderr.on('data', (data) => {
    const errorLog = removeAnsiCodes(data.toString());
    fs.appendFileSync('vite-log.txt', errorLog);
    console.error(`Vite stderr: ${errorLog}`);
});

// Vite 启动完毕时的回调
viteProcess.on('close', (code) => {
    if (code === 0) {
        console.log('Vite 服务器启动成功');
    } else {
        console.error(`Vite 启动失败，退出代码：${code}`);
    }
});

// 捕获脚本退出信号
process.on('SIGINT', () => {
    viteProcess.kill();
    if (START_DJANGO && djangoProcess) {
        djangoProcess.kill();
        console.log('脚本退出，关闭 Vite 和 Django 进程');
    } else {
        console.log('脚本退出，关闭 Vite 进程');
    }
    process.exit();
});