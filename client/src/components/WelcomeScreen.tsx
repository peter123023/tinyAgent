import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface WelcomeScreenProps {
  onSend: (text: string) => void;
}

const suggestions = [
  '查看当前目录有什么文件',
  '帮我写一个 Node.js HTTP 服务',
  '读取 package.json 的内容',
  '列出所有环境变量',
  '用 Python 写个斐波那契数列',
  '获取当前时间',
];

export default function WelcomeScreen({ onSend }: WelcomeScreenProps) {
  const { theme } = useTheme();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.avatar}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#0066cc" strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="11" stroke="#0066cc" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M12 18l4-6 4 6" stroke="#0066cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>
        <h1 style={{ ...styles.title, color: theme.welcomeTitle }}>有什么我能帮助你的？</h1>
        <p style={{ ...styles.subtitle, color: theme.welcomeSubtitle }}>
          我是一个基于 ReAct 模式的 AI 助手，可以帮你处理文件、执行命令、获取网络信息等
        </p>

        <div style={{
          ...styles.divider,
          background: typeof theme.welcomeDivider === 'string' && theme.welcomeDivider.includes('gradient')
            ? theme.welcomeDivider : theme.welcomeDivider,
        }} />

        <div style={styles.chips}>
          {suggestions.map((text, i) => (
            <button
              key={i}
              className="welcome-chip"
              style={{
                ...styles.chip,
                background: theme.welcomeChipBg,
                border: `1px solid ${theme.welcomeChipBorder}`,
                color: theme.welcomeChipText,
              }}
              onClick={() => onSend(text)}
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '40px 48px' },
  content: { display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '520px', width: '100%' },
  avatar: { width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  title: { fontSize: '24px', fontWeight: 600, margin: 0, marginBottom: '10px', letterSpacing: '-0.2px', textAlign: 'center' },
  subtitle: { fontSize: '14px', margin: 0, marginBottom: '24px', textAlign: 'center', lineHeight: '1.55', letterSpacing: '-0.04px' },
  divider: { width: '40px', height: '3px', borderRadius: '2px', marginBottom: '20px' },
  chips: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', width: '100%' },
  chip: {
    padding: '8px 16px', borderRadius: '9999px', fontSize: '13px',
    cursor: 'pointer', transition: 'all 0.15s ease',
    letterSpacing: '-0.04px', whiteSpace: 'nowrap',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
};
