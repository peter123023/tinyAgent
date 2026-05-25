import { Tool, ToolResult, ToolParameter } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';

const ALLOWED_ROOT = process.cwd();

function safePath(filePath: string): string {
  const resolved = path.resolve(ALLOWED_ROOT, filePath);
  if (!resolved.startsWith(ALLOWED_ROOT)) {
    throw new Error(`Access denied: path ${filePath} is outside workspace`);
  }
  return resolved;
}

export const readFileTool: Tool = {
  name: 'read_file',
  description: 'Read the contents of a file from the filesystem. Provide a relative or absolute path.',
  parameters: [
    { name: 'file_path', type: 'string', description: 'Path to the file to read', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const filePath = safePath(args.file_path);
      const content = await fs.readFile(filePath, 'utf-8');
      return { success: true, data: content };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const writeFileTool: Tool = {
  name: 'write_file',
  description: 'Write content to a file. Overwrites if the file already exists.',
  parameters: [
    { name: 'file_path', type: 'string', description: 'Path to the file to write', required: true },
    { name: 'content', type: 'string', description: 'Content to write to the file', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const filePath = safePath(args.file_path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, args.content, 'utf-8');
      return { success: true, data: `Successfully wrote ${args.content.length} bytes to ${args.file_path}` };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const listFilesTool: Tool = {
  name: 'list_files',
  description: 'List files and directories in a given path.',
  parameters: [
    { name: 'dir_path', type: 'string', description: 'Directory path to list', required: false },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const dirPath = args.dir_path ? safePath(args.dir_path) : ALLOWED_ROOT;
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const lines = entries.map(e => `${e.isDirectory() ? '[DIR]' : '[FILE]'} ${e.name}`);
      return { success: true, data: lines.join('\n') };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const executeCommandTool: Tool = {
  name: 'execute_command',
  description: 'Execute a shell command and return its output. Use with caution.',
  parameters: [
    { name: 'command', type: 'string', description: 'The shell command to execute', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const { execSync } = require('child_process');
      const output = execSync(args.command, {
        encoding: 'utf-8',
        timeout: 30000,
        cwd: ALLOWED_ROOT,
        shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
      });
      return { success: true, data: output || '(no output)' };
    } catch (err: any) {
      return {
        success: false,
        data: '',
        error: err.stderr || err.message || String(err),
      };
    }
  },
};

export const webFetchTool: Tool = {
  name: 'web_fetch',
  description: 'Fetch content from a URL and return it as text.',
  parameters: [
    { name: 'url', type: 'string', description: 'The URL to fetch', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const axios = require('axios');
      const resp = await axios.get(args.url, { timeout: 15000 });
      const data = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data, null, 2);
      return { success: true, data: data.substring(0, 10000) };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const getAllTools = (): Tool[] => [
  readFileTool,
  writeFileTool,
  listFilesTool,
  executeCommandTool,
  webFetchTool,
];
