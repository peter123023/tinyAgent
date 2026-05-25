export interface ToolResult {
  success: boolean;
  data: string;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameter[];
  execute(args: Record<string, string>): Promise<ToolResult>;
}

export interface ToolParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AgentConfig {
  model: string;
  apiKey: string;
  baseURL: string;
  systemPrompt: string;
  maxIterations: number;
}

export interface AgentThought {
  thought: string;
  action?: string;
  actionInput?: Record<string, string>;
  observation?: string;
}

export interface AgentResponse {
  success: boolean;
  finalAnswer: string;
  thoughts: AgentThought[];
}
