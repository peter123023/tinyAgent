import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface Conversation {
  id: string;
  title: string;
  time: string;
  active?: boolean;
}

interface SidebarProps {
  conversations: Conversation[];
  activeId: string;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({ conversations, activeId, onNewChat, onSelect, onDelete }: SidebarProps) {
  const { theme, themeName, toggleTheme } = useTheme();

  return (
    <div style={{
      ...styles.wrapper,
      background: theme.sidebarBg,
      borderRight: `1px solid ${theme.sidebarBorder}`,
    }}>
      <div style={{ ...styles.header, borderBottom: `1px solid ${theme.sidebarBorder}` }}>
        <div style={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <span style={{ ...styles.logoText, color: theme.sidebarLogoText }}>Tiny Agent</span>
        </div>
      </div>

      <button style={{ ...styles.newChatBtn, background: theme.newChatBtnBg }} onClick={onNewChat}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        新对话
      </button>

      <div style={styles.list}>
        {conversations.length === 0 && (
          <div style={{ ...styles.empty, color: theme.footerText }}>暂无对话记录</div>
        )}
        {conversations.map(c => (
          <div
            key={c.id}
            className="sidebar-item"
            style={{
              ...styles.item,
              background: c.id === activeId ? theme.sidebarActive : 'transparent',
            }}
            onClick={() => onSelect(c.id)}
          >
            <div style={styles.itemContent}>
              <div style={{ ...styles.itemTitle, color: theme.sidebarLogoText }}>{c.title}</div>
              <div style={{ ...styles.itemTime, color: theme.footerText }}>{c.time}</div>
            </div>
            <button
              className="sidebar-delete-btn"
              style={styles.deleteBtn}
              onClick={e => { e.stopPropagation(); onDelete(c.id); }}
              title="删除对话"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div style={{
        ...styles.footer,
        borderTop: `1px solid ${theme.sidebarBorder}`,
      }}>
        <button style={styles.themeBtn} onClick={toggleTheme} title={`切换到${themeName === 'default' ? '二次元' : '默认'}主题`}>
          <span style={styles.themeIcon}>{themeName === 'default' ? '🌸' : '☀️'}</span>
          <span style={{ ...styles.themeLabel, color: theme.footerText }}>{theme.label}</span>
        </button>
        <div style={styles.statusRow}>
          <div style={styles.statusDot} />
          <span style={{ ...styles.statusText, color: theme.footerText }}>ReAct</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    width: '280px',
    minWidth: '280px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    userSelect: 'none',
  },
  header: {
    padding: '16px 18px 12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontSize: '17px',
    fontWeight: 600,
    letterSpacing: '-0.12px',
  },
  newChatBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    margin: '12px 14px',
    padding: '10px 0',
    background: '#0066cc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 8px',
  },
  empty: {
    textAlign: 'center',
    fontSize: '13px',
    padding: '24px 0',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '2px',
    transition: 'background 0.1s ease',
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    letterSpacing: '-0.08px',
  },
  itemTime: {
    fontSize: '11px',
    marginTop: '2px',
  },
  deleteBtn: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    color: '#8a8a8e',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.15s ease',
    flexShrink: 0,
  },
  footer: {
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'background 0.15s ease',
  },
  themeIcon: {
    fontSize: '16px',
  },
  themeLabel: {
    fontSize: '12px',
    letterSpacing: '-0.04px',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#30d158',
  },
  statusText: {
    fontSize: '11px',
    letterSpacing: '-0.04px',
  },
};
