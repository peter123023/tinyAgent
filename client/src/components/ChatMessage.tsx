import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../contexts/ThemeContext';
import { AgentResponse } from '../api';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    thoughts?: AgentResponse['thoughts'];
    loading?: boolean;
  };
}

function ToolResultBlock({ thoughts }: { thoughts: AgentResponse['thoughts'] }) {
  const { theme } = useTheme();
  if (!thoughts || thoughts.length === 0) return null;

  return (
    <div style={{ ...intStyles.thoughts, borderTop: `1px solid ${theme.thoughtStepBorder}` }}>
      <div
        style={intStyles.thoughtsHeader}
        onClick={e => {
          const target = e.currentTarget.nextElementSibling as HTMLElement;
          if (target) target.style.display = target.style.display === 'none' ? 'block' : 'none';
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        推理过程 ({thoughts.length} 步)
      </div>
      <div style={intStyles.thoughtsBody}>
        {thoughts.map((t, i) => (
          <div key={i} style={{
            ...intStyles.thoughtStep,
            background: theme.thoughtStepBg,
            border: `1px solid ${theme.thoughtStepBorder}`,
          }}>
            <div style={intStyles.stepTitle}>Step {i + 1}</div>
            <div style={intStyles.stepLabel}>💭 思考</div>
            <div style={intStyles.stepText}>{t.thought}</div>
            {t.action && (
              <>
                <div style={intStyles.stepLabel}>🔧 行动</div>
                <div style={{ ...intStyles.stepCode, background: theme.thoughtCodeBg }}>
                  <code>{t.action}</code>
                  {t.actionInput && <pre>{JSON.stringify(t.actionInput, null, 2)}</pre>}
                </div>
              </>
            )}
            {t.observation && (
              <>
                <div style={intStyles.stepLabel}>{t.observation.startsWith('Error') ? '⚠️ 错误' : '📡 观察'}</div>
                <pre style={{
                  ...intStyles.stepPre,
                  background: theme.thoughtCodeBg,
                  color: t.observation.startsWith('Error') ? '#ff3b30' : theme.footerText,
                }}>{t.observation}</pre>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { theme } = useTheme();
  const isUser = message.role === 'user';
  const isLoading = message.loading;

  return (
    <div style={{ ...intStyles.wrapper, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        ...intStyles.bubble,
        background: isUser ? theme.userBubble : theme.aiBubble,
        color: isUser ? theme.userText : theme.aiText,
        border: isUser ? 'none' : `1px solid ${theme.aiBorder}`,
        boxShadow: isUser ? 'none' : theme.aiShadow,
        borderBottomRightRadius: isUser ? '4px' : '18px',
        borderBottomLeftRadius: isUser ? '18px' : '4px',
        maxWidth: isUser ? '65%' : '85%',
      }}>
        {isLoading ? (
          <div style={intStyles.loading}>
            <span style={intStyles.dot}></span>
            <span style={{ ...intStyles.dot, animationDelay: '0.16s' }}></span>
            <span style={{ ...intStyles.dot, animationDelay: '0.32s' }}></span>
          </div>
        ) : isUser ? (
          <div style={intStyles.userText}>{message.content}</div>
        ) : (
          <>
            <div className="markdown-body" style={{ color: theme.mdText }}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
            {message.thoughts && <ToolResultBlock thoughts={message.thoughts} />}
          </>
        )}
      </div>
    </div>
  );
}

const intStyles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', width: '100%', animation: 'fadeIn 0.25s ease' },
  bubble: { borderRadius: '18px', padding: '12px 18px', lineHeight: '1.5', fontSize: '15px' },
  userText: { color: '#ffffff', fontSize: '15px', lineHeight: '1.5', letterSpacing: '-0.08px' },
  thoughts: { marginTop: '10px', paddingTop: '8px' },
  thoughtsHeader: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8a8a8a', cursor: 'pointer', padding: '4px 0', userSelect: 'none', letterSpacing: '-0.04px' },
  thoughtsBody: { marginTop: '8px' },
  thoughtStep: { borderRadius: '10px', padding: '10px 14px', marginBottom: '8px' },
  stepTitle: { fontSize: '11px', fontWeight: 600, color: '#8a8a8a', marginBottom: '6px', letterSpacing: '0.3px', textTransform: 'uppercase' },
  stepLabel: { fontSize: '12px', fontWeight: 600, color: '#1d1d1f', marginTop: '6px', marginBottom: '2px', letterSpacing: '-0.04px' },
  stepText: { fontSize: '13px', color: '#555557', lineHeight: '1.5' },
  stepCode: { borderRadius: '6px', padding: '6px 10px', marginTop: '2px', fontSize: '12px', fontFamily: 'SF Mono, Monaco, monospace', color: '#555557' },
  stepPre: { fontSize: '12px', padding: '6px 10px', borderRadius: '6px', marginTop: '2px', whiteSpace: 'pre-wrap', maxHeight: '120px', overflowY: 'auto', fontFamily: 'SF Mono, Monaco, monospace', lineHeight: '1.4' },
  loading: { display: 'flex', gap: '6px', alignItems: 'center', padding: '4px 0' },
  dot: { width: '8px', height: '8px', borderRadius: '50%', background: '#0066cc', animation: 'bounce 1.2s infinite ease-in-out both', opacity: 0.5 },
};
