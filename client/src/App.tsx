import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { themes, ThemeName, ThemeColors } from './themes';
import { sendMessage, AgentResponse } from './api';

const STORAGE_KEY = 'tiny-agent-conversations';
const THEME_KEY = 'tiny-agent-theme';
const WELCOME_TITLE = '新对话';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thoughts?: AgentResponse['thoughts'];
  loading?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  time: string;
  messages: Message[];
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function createConversation(): Conversation {
  return {
    id: uid(),
    title: WELCOME_TITLE,
    time: formatTime(),
    messages: [],
  };
}

function loadFromStorage(): { conversations: Conversation[]; activeId: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data.conversations) || data.conversations.length === 0) return null;
    data.conversations.forEach((c: Conversation) => {
      c.messages = c.messages.filter(m => !m.loading);
    });
    return {
      conversations: data.conversations,
      activeId: data.activeId || data.conversations[0].id,
    };
  } catch {
    return null;
  }
}

function saveToStorage(conversations: Conversation[], activeId: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, activeId }));
  } catch { /* ignore */ }
}

function loadTheme(): ThemeName {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'anime' || t === 'default') return t;
  } catch { /* ignore */ }
  return 'default';
}

function initState(): { conversations: Conversation[]; activeId: string } {
  const saved = loadFromStorage();
  if (saved) return saved;
  const c = createConversation();
  return { conversations: [c], activeId: c.id };
}

export default function App() {
  const initial = useRef(initState());
  const [conversations, setConversations] = useState<Conversation[]>(initial.current.conversations);
  const [activeConvId, setActiveConvId] = useState(initial.current.activeId);
  const [loading, setLoading] = useState(false);
  const [themeName, setThemeName] = useState<ThemeName>(loadTheme);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const theme: ThemeColors = themes[themeName];
  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const messages = activeConv?.messages || [];

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    saveToStorage(conversations, activeConvId);
  }, [conversations, activeConvId]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--scroll-thumb', theme.scrollThumb);
    root.style.setProperty('--scroll-hover', theme.scrollHover);
    root.style.setProperty('--md-code-bg', theme.mdCodeBg);
    root.style.setProperty('--md-pre-bg', theme.mdPreBg);
    root.style.setProperty('--md-li-bg', theme.mdLiBg);
  }, [themeName]);

  const toggleTheme = () => {
    const next = themeName === 'default' ? 'anime' : 'default';
    setThemeName(next);
    localStorage.setItem(THEME_KEY, next);
  };

  const updateConversation = (convId: string, updater: (c: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => c.id === convId ? updater(c) : c));
  };

  const handleNewChat = () => {
    const newConv = createConversation();
    setConversations(prev => [...prev, newConv]);
    setActiveConvId(newConv.id);
  };

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
  };

  const handleDeleteConv = (id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const newConv = createConversation();
        setActiveConvId(newConv.id);
        return [newConv];
      }
      if (activeConvId === id) {
        const idx = prev.findIndex(c => c.id === id);
        const nextIdx = Math.min(idx, filtered.length - 1);
        setActiveConvId(filtered[nextIdx].id);
      }
      return filtered;
    });
  };

  const handleSend = async (text: string) => {
    if (!activeConv) return;
    const userMsg: Message = { id: uid(), role: 'user', content: text };
    const loadingMsg: Message = { id: uid(), role: 'assistant', content: '思考中...', loading: true };
    updateConversation(activeConv.id, conv => ({
      ...conv,
      title: conv.title === WELCOME_TITLE ? text.substring(0, 30) + (text.length > 30 ? '...' : '') : conv.title,
      messages: [...conv.messages, userMsg, loadingMsg],
    }));
    setLoading(true);
    try {
      const result = await sendMessage(text);
      updateConversation(activeConv.id, conv => {
        const withoutLoading = conv.messages.filter(m => !m.loading);
        const finalMsg: Message = { id: uid(), role: 'assistant', content: result.finalAnswer, thoughts: result.thoughts };
        return { ...conv, messages: [...withoutLoading, finalMsg] };
      });
    } catch (err: any) {
      updateConversation(activeConv.id, conv => {
        const withoutLoading = conv.messages.filter(m => !m.loading);
        const errMsg: Message = { id: uid(), role: 'assistant', content: `❌ 错误: ${err.message}` };
        return { ...conv, messages: [...withoutLoading, errMsg] };
      });
    } finally {
      setLoading(false);
    }
  };

  const sidebarConvs = conversations.map(c => ({
    id: c.id, title: c.title, time: c.time, active: c.id === activeConvId,
  }));

  return (
    <ThemeProvider value={{ theme, themeName, toggleTheme }}>
      <div style={{ ...styles.layout, background: themeName === 'anime' ? '#f3e5f5' : '#1d1d1f' }}>
        <Sidebar
          conversations={sidebarConvs}
          activeId={activeConvId}
          onNewChat={handleNewChat}
          onSelect={handleSelectConv}
          onDelete={handleDeleteConv}
        />
        <div style={{ ...styles.main, background: theme.mainBg }}>
          {messages.length === 0 ? (
            <WelcomeScreen onSend={handleSend} />
          ) : (
            <div style={{ ...styles.chatArea, padding: theme.chatAreaPadding } as React.CSSProperties}>
              {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
              <div ref={msgEndRef} />
            </div>
          )}
          <div style={{ ...styles.inputArea, background: theme.inputAreaBg }}>
            <ChatInput onSend={handleSend} disabled={loading} />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: 'flex',
    height: '100vh',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
  },
  inputArea: {
    padding: '12px 48px 20px',
  },
};
