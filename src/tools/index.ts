import { Tool, ToolResult } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

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
  description: 'Read the contents of a file from the filesystem.',
  parameters: [
    { name: 'file_path', type: 'string', description: 'Path to the file', required: true },
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
  description: 'Write content to a file. Overwrites if exists.',
  parameters: [
    { name: 'file_path', type: 'string', description: 'Path to write to', required: true },
    { name: 'content', type: 'string', description: 'Content to write', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const filePath = safePath(args.file_path);
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, args.content, 'utf-8');
      return { success: true, data: `Wrote ${args.content.length} bytes to ${args.file_path}` };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const deleteFileTool: Tool = {
  name: 'delete_file',
  description: 'Delete a file from the filesystem.',
  parameters: [
    { name: 'file_path', type: 'string', description: 'Path to the file to delete', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const filePath = safePath(args.file_path);
      await fs.unlink(filePath);
      return { success: true, data: `Deleted ${args.file_path}` };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const listFilesTool: Tool = {
  name: 'list_files',
  description: 'List files and directories in a given path.',
  parameters: [
    { name: 'dir_path', type: 'string', description: 'Directory to list', required: false },
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

export const searchTextTool: Tool = {
  name: 'search_text',
  description: 'Search for text in files. Case-insensitive by default.',
  parameters: [
    { name: 'pattern', type: 'string', description: 'Text to search for', required: true },
    { name: 'path', type: 'string', description: 'File or directory to search in', required: false },
    { name: 'ext', type: 'string', description: 'File extension filter like "ts" or "js"', required: false },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const searchDir = args.path ? safePath(args.path) : ALLOWED_ROOT;
      const stat = await fs.stat(searchDir);
      let files: string[] = [];

      if (stat.isFile()) {
        files = [searchDir];
      } else {
        const all = await fs.readdir(searchDir, { recursive: true });
        files = all
          .filter(f => {
            if (args.ext) return f.endsWith('.' + args.ext);
            return !f.includes('node_modules') && !f.startsWith('.');
          })
          .map(f => path.join(searchDir, f));
      }

      const pattern = args.pattern.toLowerCase();
      const results: string[] = [];

      for (const file of files.slice(0, 200)) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(pattern)) {
              const rel = path.relative(ALLOWED_ROOT, file);
              results.push(`${rel}:${i + 1}: ${lines[i].trim().substring(0, 150)}`);
              if (results.length >= 100) break;
            }
          }
        } catch { /* skip unreadable */ }
        if (results.length >= 100) break;
      }

      return { success: true, data: results.length > 0 ? results.join('\n') : '(no matches)' };
    } catch (err: any) {
      return { success: false, data: '', error: err.message };
    }
  },
};

export const currentTimeTool: Tool = {
  name: 'current_time',
  description: 'Get the current date and time.',
  parameters: [],
  async execute(_args): Promise<ToolResult> {
    return { success: true, data: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) };
  },
};

export const getEnvTool: Tool = {
  name: 'get_env',
  description: 'Get the value of an environment variable.',
  parameters: [
    { name: 'name', type: 'string', description: 'Environment variable name', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    const value = process.env[args.name];
    if (value === undefined) {
      return { success: false, data: '', error: `Environment variable "${args.name}" is not set` };
    }
    return { success: true, data: `${args.name}=${value}` };
  },
};

export const jsonFormatTool: Tool = {
  name: 'json_format',
  description: 'Format, validate, or extract from a JSON string.',
  parameters: [
    { name: 'input', type: 'string', description: 'JSON string to process', required: true },
    { name: 'indent', type: 'string', description: 'Indentation size (2 or 4)', required: false },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const parsed = JSON.parse(args.input);
      const indent = parseInt(args.indent || '2', 10);
      return { success: true, data: JSON.stringify(parsed, null, indent) };
    } catch (err: any) {
      return { success: false, data: '', error: `Invalid JSON: ${err.message}` };
    }
  },
};

export const mathEvalTool: Tool = {
  name: 'math_eval',
  description: 'Evaluate a math expression safely. Supports + - * / ( ) and basic math functions.',
  parameters: [
    { name: 'expression', type: 'string', description: 'Math expression to evaluate', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
      const sanitized = args.expression.replace(/[^0-9+\-*/.() \t\^e]/g, '');
      const fn = new Function(`return (${sanitized})`);
      const result = fn();
      return { success: true, data: String(result) };
    } catch (err: any) {
      return { success: false, data: '', error: `Invalid expression: ${err.message}` };
    }
  },
};

export const executeCommandTool: Tool = {
  name: 'execute_command',
  description: 'Execute a shell command and return its output. Use with caution.',
  parameters: [
    { name: 'command', type: 'string', description: 'Shell command to execute', required: true },
  ],
  async execute(args): Promise<ToolResult> {
    try {
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
  description: 'Fetch content from a URL.',
  parameters: [
    { name: 'url', type: 'string', description: 'URL to fetch', required: true },
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
  deleteFileTool,
  listFilesTool,
  searchTextTool,
  currentTimeTool,
  getEnvTool,
  jsonFormatTool,
  mathEvalTool,
  executeCommandTool,
  webFetchTool,
];
