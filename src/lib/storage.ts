// Local Storage utilities for Tsukino

const STORAGE_KEYS = {
    WATCHLIST: 'tsukino_watchlist',
    HISTORY: 'tsukino_history',
    PROGRESS: 'tsukino_progress',
    THEME: 'tsukino_theme',
};

// Types
export interface WatchlistItem {
    id: string;
    title: string;
    image: string;
    addedAt: number;
}

export interface HistoryItem {
    animeId: string;
    episodeId: string;
    episodeNumber: number;
    animeTitle: string;
    animeImage: string;
    watchedAt: number;
    progress?: number; // seconds watched
}

export interface WatchProgress {
    episodeId: string;
    currentTime: number;
    duration: number;
    completed: boolean;
}

// Helper to check if we're in browser
const isBrowser = typeof window !== 'undefined';

// ========================================
// WATCHLIST
// ========================================
export function getWatchlist(): WatchlistItem[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    return data ? JSON.parse(data) : [];
}

export function addToWatchlist(item: Omit<WatchlistItem, 'addedAt'>): void {
    if (!isBrowser) return;
    const watchlist = getWatchlist();
    if (!watchlist.find(w => w.id === item.id)) {
        watchlist.unshift({ ...item, addedAt: Date.now() });
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    }
}

export function removeFromWatchlist(id: string): void {
    if (!isBrowser) return;
    const watchlist = getWatchlist().filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
}

export function isInWatchlist(id: string): boolean {
    return getWatchlist().some(w => w.id === id);
}

// ========================================
// WATCH HISTORY
// ========================================
export function getHistory(): HistoryItem[] {
    if (!isBrowser) return [];
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
}

export function addToHistory(item: Omit<HistoryItem, 'watchedAt'>): void {
    if (!isBrowser) return;
    let history = getHistory();

    // Remove if already exists (to move to top)
    history = history.filter(h => h.episodeId !== item.episodeId);

    // Add to front
    history.unshift({ ...item, watchedAt: Date.now() });

    // Keep only last 50 items
    history = history.slice(0, 50);

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

export function clearHistory(): void {
    if (!isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

// ========================================
// WATCH PROGRESS (for resume functionality)
// ========================================
export function getProgress(episodeId: string): WatchProgress | null {
    if (!isBrowser) return null;
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const allProgress: Record<string, WatchProgress> = data ? JSON.parse(data) : {};
    return allProgress[episodeId] || null;
}

export function saveProgress(progress: WatchProgress): void {
    if (!isBrowser) return;
    const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    const allProgress: Record<string, WatchProgress> = data ? JSON.parse(data) : {};
    allProgress[progress.episodeId] = progress;
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
}

// ========================================
// THEME
// ========================================
export function getTheme(): 'dark' | 'light' {
    if (!isBrowser) return 'dark';
    return (localStorage.getItem(STORAGE_KEYS.THEME) as 'dark' | 'light') || 'dark';
}

export function setTheme(theme: 'dark' | 'light'): void {
    if (!isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme(): 'dark' | 'light' {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
}
