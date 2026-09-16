export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'flowdo_theme_mode';

/**
 * 브라우저 환경 여부
 */
export const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * 저장된 테마 가져오기 (기본값: 'dark')
 */
export function getStoredTheme(): ThemeMode {
  if (!isBrowser()) return 'dark';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    // 시스템 기본 설정 확인
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  } catch (err) {
    console.error('[Theme] Failed to read stored theme:', err);
  }
  return 'dark';
}

/**
 * 테마 적용 및 로컬 스토리지 보존
 */
export function applyTheme(theme: ThemeMode): void {
  if (!isBrowser()) return;
  try {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
    window.dispatchEvent(new CustomEvent('flowdo_theme_change', { detail: theme }));
  } catch (err) {
    console.error('[Theme] Failed to apply theme:', err);
  }
}

/**
 * 테마 토글 ('light' <-> 'dark')
 */
export function toggleTheme(): ThemeMode {
  const current = getStoredTheme();
  const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
