# Tiny Agent

基于 Node.js 的迷你 Agent 框架，ReAct（Reasoning + Acting）模式运行。

## 功能

- ReAct 推理循环：思考 → 行动 → 观察 → 最终回答
- 内置工具：文件读写、目录列表、Shell 命令、网络请求
- 两种模式：CLI 终端 / Web 浏览器
- 支持 OpenAI 兼容的 LLM API

## 快速开始

### 1. 配置

```bash
cp .env.example .env
```

编辑 `.env`，填入 LLM API Key 和模型名。

### 2. 安装 & 构建

```bash
npm install
cd client && npm install && cd ..
npm run build
cd client && npm run build && cd ..
```

### 3. 运行

CLI 模式：

```bash
npm run dev
```

Web 模式：

```bash
npm run dev:server
```

浏览器打开 `http://localhost:3001`。指定端口：

```bash
npx tsx src/index.ts --server --port 8080
```


## LLM API

兼容 OpenAI 格式的接口均可使用：

| 服务 | BASE_URL | Model |
|------|----------|-------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| Kimi | `https://api.moonshot.cn/v1` | `kimi-k2.6` |
| Ollama | `http://localhost:11434/v1` | `llama3` |
