import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div className="input-wrapper" style={{
        ...styles.inputWrapper,
        background: theme.inputBg,
        border: `1px solid ${theme.inputBorder}`,
      }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="发送消息…"
          disabled={disabled}
          style={{ ...styles.textarea, color: theme.inputText }}
          rows={3}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          style={{
            ...styles.sendBtn,
            background: text.trim() ? theme.inputSendBg : theme.inputSendDisabled,
            cursor: text.trim() ? 'pointer' : 'default',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        </button>
      </div>
      <div style={{ ...styles.hint, color: theme.inputHint }}>
        Enter 发送 · Shift + Enter 换行
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', gap: '6px' },
  inputWrapper: {
    display: 'flex', gap: '10px', alignItems: 'flex-end',
    borderRadius: '12px', padding: '6px 6px 6px 20px',
    transition: 'border-color 0.15s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  textarea: {
    flex: 1, background: 'transparent', border: 'none', outline: 'none',
    fontSize: '15px', fontFamily: 'system-ui, -apple-system, sans-serif',
    resize: 'none', maxHeight: '120px', lineHeight: '1.5',
    letterSpacing: '-0.08px', padding: '6px 0',
  },
  sendBtn: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: 'none', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0, transition: 'all 0.12s ease',
  },
  hint: { fontSize: '11px', textAlign: 'right', paddingRight: '8px', letterSpacing: '-0.04px' },
};
