import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { ReActAgent } from '../agent/react';
import { getAllTools } from '../tools';

const app = express();
app.use(cors());
app.use(express.json());

let agent: ReActAgent | null = null;
function getAgent(): ReActAgent {
  if (!agent) {
    console.log('[Server] 初始化 Agent...');
    console.log(`[Server] LLM_MODEL=${process.env.LLM_MODEL || '(未设置)'}`);
    console.log(`[Server] LLM_BASE_URL=${process.env.LLM_BASE_URL || '(未设置)'}`);
    console.log(`[Server] LLM_API_KEY=${process.env.LLM_API_KEY ? '已配置' : '(未设置)'}`);
    agent = new ReActAgent({}, getAllTools());
    console.log('[Server] Agent 初始化完成');
  }
  return agent;
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    mode: 'server',
    env: {
      model: process.env.LLM_MODEL || '',
      baseURL: process.env.LLM_BASE_URL || '',
      hasKey: !!process.env.LLM_API_KEY,
    },
  });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  console.log(`[API] POST /api/chat 收到请求, message="${message?.substring(0, 50)}"`);

  if (!message || typeof message !== 'string') {
    console.warn('[API] 参数错误: message 缺失');
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    console.warn('[API] 请求超时 (120s)');
    controller.abort();
  }, 120000);

  try {
    const ag = getAgent();
    console.log('[API] 开始调用 agent.run()...');
    const startTime = Date.now();

    const result = await Promise.race([
      ag.run(message),
      new Promise<never>((_, reject) =>
        controller.signal.addEventListener('abort', () =>
          reject(new Error('请求超时，LLM 响应时间过长'))
        )
      ),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`[API] agent.run() 完成, 耗时 ${elapsed}ms`);
    console.log(`[API] 结果: success=${result.success}, answer_length=${result.finalAnswer.length}, thoughts_count=${result.thoughts.length}`);

    clearTimeout(timeout);
    res.json(result);
  } catch (err: any) {
    clearTimeout(timeout);
    const msg = err.message || String(err);
    console.error('[API] 错误:', msg);
    if (err.stack) console.error('[API] Stack:', err.stack.split('\n').slice(0, 4).join('\n'));
    res.status(500).json({ error: msg });
  }
});

export function startServer(port: number = 3001) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Tiny Agent Server running at http://localhost:${port}`);
    console.log(`API endpoint: http://localhost:${port}/api/chat`);
  });
}
