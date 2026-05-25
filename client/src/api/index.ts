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

export async function sendMessage(message: string): Promise<AgentResponse> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!resp.ok) {
    throw new Error(`API error: ${resp.statusText}`);
  }
  return resp.json();
}
