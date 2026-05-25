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

export interface StreamEvent {
  type: 'thought' | 'action' | 'observation' | 'answer_chunk' | 'done' | 'error';
  iteration?: number;
  content?: string;
  tool?: string;
  actionInput?: Record<string, string>;
  success?: boolean;
  error?: string;
}

export type StreamCallback = (event: StreamEvent) => void;

export async function sendMessageStream(message: string, onEvent: StreamCallback): Promise<void> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`API error: ${resp.status} ${text}`);
  }

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7).trim();
      } else if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onEvent({ type: currentEvent as StreamEvent['type'], ...data });
        } catch { /* skip malformed */ }
        currentEvent = '';
      }
    }
  }
}

// Keep non-streaming for backward compat
export async function sendMessage(message: string): Promise<AgentResponse> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!resp.ok) throw new Error(`API error: ${resp.statusText}`);
  return resp.json();
}
