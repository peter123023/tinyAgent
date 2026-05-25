import OpenAI from 'openai';
import { Tool, AgentConfig, AgentThought, AgentResponse, Message } from '../types';

const REACT_SYSTEM_PROMPT = `You are a helpful AI assistant that uses the ReAct (Reasoning + Acting) pattern.
You have access to the following tools. Use them to help users achieve their goals.

When you need to use a tool, respond with EXACTLY this format:
Thought: Your reasoning about what to do next.
Action: tool_name
Action Input: {"param1": "value1", "param2": "value2"}

When you have enough information to answer, respond with:
Thought: Your reasoning that you have the answer.
Final Answer: Your complete answer to the user.

IMPORTANT RULES:
- Only use tools when necessary.
- Always use valid JSON for Action Input.
- If a tool returns an error, try a different approach.
- Be thorough and complete in your Final Answer.`;

function buildToolDescriptions(tools: Tool[]): string {
  return tools
    .map(
      t =>
        `- ${t.name}: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters.map(p => ({ name: p.name, type: p.type, required: p.required })))}`
    )
    .join('\n');
}

const ACTION_REGEX = /Action:\s*(\w+)\s*\nAction Input:\s*(\{.*\})/s;
const FINAL_REGEX = /Final Answer:\s*(.*)/s;
const THOUGHT_REGEX = /Thought:\s*(.*)/s;

function parseAction(text: string): { thought?: string; action?: string; actionInput?: Record<string, string> } | null {
  const actionMatch = text.match(ACTION_REGEX);
  const finalMatch = text.match(FINAL_REGEX);

  if (actionMatch) {
    const thoughtMatch = text.match(THOUGHT_REGEX);
    try {
      const actionInput = JSON.parse(actionMatch[2]);
      return {
        thought: thoughtMatch ? thoughtMatch[1].trim() : undefined,
        action: actionMatch[1],
        actionInput,
      };
    } catch {
      return null;
    }
  }

  if (finalMatch) {
    return { thought: finalMatch[1].trim() };
  }

  return { thought: text.trim() };
}

export class ReActAgent {
  private config: AgentConfig;
  private tools: Tool[];
  private client: OpenAI;

  constructor(config: Partial<AgentConfig>, tools: Tool[]) {
    this.config = {
      model: config.model || process.env.LLM_MODEL || 'gpt-4o-mini',
      apiKey: config.apiKey || process.env.LLM_API_KEY || '',
      baseURL: config.baseURL || process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
      systemPrompt: config.systemPrompt || '',
      maxIterations: config.maxIterations || 15,
    };
    this.tools = tools;
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      timeout: 60000,
      maxRetries: 2,
    });
  }

  async run(userInput: string): Promise<AgentResponse> {
    const thoughts: AgentThought[] = [];
    const toolDesc = buildToolDescriptions(this.tools);
    const systemPrompt = [
      REACT_SYSTEM_PROMPT,
      `\n\nAvailable Tools:\n${toolDesc}`,
      this.config.systemPrompt ? `\n\nExtra Context:\n${this.config.systemPrompt}` : '',
    ].join('');

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ];

    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      const response = await this.callLLM(messages);
      const content = response.choices[0]?.message?.content?.trim() || '';

      messages.push({ role: 'assistant', content });
      console.log(`\n[Agent Iteration ${iteration + 1}]\n${content}\n`);

      const parsed = parseAction(content);

      if (!parsed) {
        thoughts.push({
          thought: content,
          action: undefined,
          actionInput: undefined,
          observation: 'Could not parse action format',
        });
        return {
          success: false,
          finalAnswer: content,
          thoughts,
        };
      }

      if (parsed.action && parsed.actionInput) {
        const tool = this.tools.find(t => t.name === parsed.action);
        if (!tool) {
          const observation = `Error: Unknown tool "${parsed.action}". Available tools: ${this.tools.map(t => t.name).join(', ')}`;
          thoughts.push({
            thought: parsed.thought || '',
            action: parsed.action,
            actionInput: parsed.actionInput,
            observation,
          });
          messages.push({ role: 'system', content: `Observation: ${observation}` });
          continue;
        }

        const result = await tool.execute(parsed.actionInput);
        const observation = result.success
          ? `Observation:\n${result.data.substring(0, 3000)}`
          : `Error: ${result.error}`;

        thoughts.push({
          thought: parsed.thought || '',
          action: parsed.action,
          actionInput: parsed.actionInput,
          observation,
        });

        messages.push({ role: 'system', content: observation });
      } else if (parsed.thought) {
        thoughts.push({ thought: parsed.thought });
        return {
          success: true,
          finalAnswer: parsed.thought,
          thoughts,
        };
      } else {
        thoughts.push({
          thought: content,
          action: undefined,
          actionInput: undefined,
          observation: 'Unexpected response format',
        });
        return {
          success: false,
          finalAnswer: content,
          thoughts,
        };
      }
    }

    return {
      success: false,
      finalAnswer: 'Max iterations reached without a final answer.',
      thoughts,
    };
  }

  private async callLLM(messages: Message[]) {
    try {
      return await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages as any,
        temperature: 1,
        max_tokens: 2048,
      });
    } catch (err: any) {
      const status = err.status || err.code || '';
      const msg = err.message || String(err);
      throw new Error(`LLM API 调用失败 [${status}]: ${msg}`);
    }
  }
}
