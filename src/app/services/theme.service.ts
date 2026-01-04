import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    private readonly STORAGE_KEY = 'task_manager_theme';

    // Theme signal
    private themeSignal = signal<Theme>(this.loadThemeFromStorage());

    // Public computed
    theme = this.themeSignal.asReadonly();
    isDark = () => this.themeSignal() === 'dark';

    constructor() {
        // Apply theme on init
        this.applyTheme(this.themeSignal());

        // Auto-save theme changes
        effect(() => {
            const currentTheme = this.themeSignal();
            localStorage.setItem(this.STORAGE_KEY, currentTheme);
            this.applyTheme(currentTheme);
        });
    }

    private loadThemeFromStorage(): Theme {
        const stored = localStorage.getItem(this.STORAGE_KEY) as Theme;
        if (stored === 'light' || stored === 'dark') {
            return stored;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    private applyTheme(theme: Theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }

    toggleTheme() {
        this.themeSignal.update(current => current === 'light' ? 'dark' : 'light');
    }

    setTheme(theme: Theme) {
        this.themeSignal.set(theme);
    }
}
