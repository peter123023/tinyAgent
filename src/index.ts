import dotenv from 'dotenv';
dotenv.config();

import { startCLI } from './cli';
import { startServer } from './server';

if (!process.env.LLM_API_KEY || process.env.LLM_API_KEY.startsWith('your-') || process.env.LLM_API_KEY.startsWith('sk-your')) {
  console.error('❌ LLM_API_KEY 未配置');
  console.error('   在 .env 里填上 Key 再跑。参考 .env.example\n');
  process.exit(1);
}

const args = process.argv.slice(2);

if (args.includes('--server') || args.includes('-s')) {
  const portIndex = args.indexOf('--port');
  const port = portIndex >= 0 ? parseInt(args[portIndex + 1], 10) || 3001 : 3001;
  console.log('Starting Tiny Agent in Web Server mode...');
  startServer(port);
} else {
  console.log('Starting Tiny Agent in CLI mode...');
  startCLI();
}
