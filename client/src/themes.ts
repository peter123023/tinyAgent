export interface ThemeColors {
  name: string;
  label: string;
  icon: string;
  // Layout
  sidebarBg: string;
  sidebarBorder: string;
  sidebarHover: string;
  sidebarActive: string;
  sidebarLogoText: string;
  newChatBtnBg: string;
  mainBg: string;
  chatAreaPadding: string;
  inputAreaBg: string;
  // Bubbles
  userBubble: string;
  userText: string;
  aiBubble: string;
  aiBorder: string;
  aiShadow: string;
  aiText: string;
  // Welcome
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeDivider: string;
  welcomeChipBg: string;
  welcomeChipBorder: string;
  welcomeChipText: string;
  // Input
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputSendBg: string;
  inputSendDisabled: string;
  inputHint: string;
  // Thoughts
  thoughtStepBg: string;
  thoughtStepBorder: string;
  thoughtCodeBg: string;
  // Markdown
  mdText: string;
  mdCodeBg: string;
  mdCodeText: string;
  mdPreBg: string;
  mdLiBg: string;
  mdBold: string;
  // Scrollbar
  scrollThumb: string;
  scrollHover: string;
  // Footer
  footerBorder: string;
  footerText: string;
}

export const defaultTheme: ThemeColors = {
  name: 'default',
  label: '默认',
  icon: '☀️',
  sidebarBg: '#f5f5f7',
  sidebarBorder: '#d2d2d7',
  sidebarHover: '#e8e8ea',
  sidebarActive: '#e8e8ea',
  sidebarLogoText: '#1d1d1f',
  newChatBtnBg: '#0066cc',
  mainBg: '#f5f5f7',
  chatAreaPadding: '24px 48px',
  inputAreaBg: '#f5f5f7',
  userBubble: '#0066cc',
  userText: '#ffffff',
  aiBubble: '#ffffff',
  aiBorder: '#e0e0e0',
  aiShadow: '0 1px 3px rgba(0,0,0,0.04)',
  aiText: '#1d1d1f',
  welcomeTitle: '#1d1d1f',
  welcomeSubtitle: '#86868b',
  welcomeDivider: '#d2d2d7',
  welcomeChipBg: '#ffffff',
  welcomeChipBorder: '#d2d2d7',
  welcomeChipText: '#1d1d1f',
  inputBg: '#ffffff',
  inputBorder: '#d2d2d7',
  inputText: '#1d1d1f',
  inputSendBg: '#0066cc',
  inputSendDisabled: '#d2d2d7',
  inputHint: '#8a8a8e',
  thoughtStepBg: '#fafafc',
  thoughtStepBorder: '#f0f0f0',
  thoughtCodeBg: '#f5f5f7',
  mdText: '#1d1d1f',
  mdCodeBg: '#f0f0f2',
  mdCodeText: '#1d1d1f',
  mdPreBg: '#f0f0f2',
  mdLiBg: 'rgba(0,0,0,0.02)',
  mdBold: '#1d1d1f',
  scrollThumb: '#d2d2d7',
  scrollHover: '#b0b0b5',
  footerBorder: '#d2d2d7',
  footerText: '#8a8a8e',
};

export const animeTheme: ThemeColors = {
  name: 'anime',
  label: '二次元',
  icon: '🌸',
  sidebarBg: 'linear-gradient(180deg, #fce4ec 0%, #f3e5f5 100%)',
  sidebarBorder: 'rgba(233,30,99,0.2)',
  sidebarHover: 'rgba(233,30,99,0.08)',
  sidebarActive: 'rgba(233,30,99,0.12)',
  sidebarLogoText: '#e91e63',
  newChatBtnBg: 'linear-gradient(135deg, #e91e63, #9c27b0)',
  mainBg: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)',
  chatAreaPadding: '24px 48px',
  inputAreaBg: 'rgba(255,255,255,0.7)',
  userBubble: 'linear-gradient(135deg, #e91e63, #9c27b0)',
  userText: '#ffffff',
  aiBubble: '#ffffff',
  aiBorder: 'rgba(233,30,99,0.15)',
  aiShadow: '0 2px 8px rgba(233,30,99,0.08)',
  aiText: '#4a148c',
  welcomeTitle: '#e91e63',
  welcomeSubtitle: '#9c27b0',
  welcomeDivider: 'linear-gradient(90deg, #e91e63, #9c27b0)',
  welcomeChipBg: '#ffffff',
  welcomeChipBorder: 'rgba(233,30,99,0.2)',
  welcomeChipText: '#e91e63',
  inputBg: '#ffffff',
  inputBorder: 'rgba(233,30,99,0.2)',
  inputText: '#4a148c',
  inputSendBg: 'linear-gradient(135deg, #e91e63, #9c27b0)',
  inputSendDisabled: '#f0b4c4',
  inputHint: '#ce93d8',
  thoughtStepBg: '#fff0f5',
  thoughtStepBorder: 'rgba(233,30,99,0.1)',
  thoughtCodeBg: '#fce4ec',
  mdText: '#4a148c',
  mdCodeBg: '#fce4ec',
  mdCodeText: '#e91e63',
  mdPreBg: '#fce4ec',
  mdLiBg: 'rgba(233,30,99,0.03)',
  mdBold: '#e91e63',
  scrollThumb: '#f0bbd0',
  scrollHover: '#e18eb8',
  footerBorder: 'rgba(233,30,99,0.2)',
  footerText: '#ce93d8',
};

export type ThemeName = 'default' | 'anime';
export const themes: Record<ThemeName, ThemeColors> = { default: defaultTheme, anime: animeTheme };
