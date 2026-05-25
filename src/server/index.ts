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
  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const ag = getAgent();
  let done = false;

  const timeout = setTimeout(() => {
    if (!done) {
      res.write(`event: error\ndata: {"error":"Request timeout"}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
      res.end();
      done = true;
    }
  }, 120000);

  try {
    const stream = ag.runStream(message);
    for await (const event of stream) {
      if (done) break;
      res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
      if (event.type === 'done' || event.type === 'error') {
        done = true;
        clearTimeout(timeout);
      }
    }
  } catch (err: any) {
    if (!done) {
      res.write(`event: error\ndata: {"error":"${err.message}"}\n\n`);
      res.write(`event: done\ndata: {}\n\n`);
    }
  } finally {
    if (!done) {
      clearTimeout(timeout);
      res.write(`event: done\ndata: {}\n\n`);
    }
    res.end();
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
