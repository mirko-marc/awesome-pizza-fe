import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type AppTheme = 'pizzalight' | 'pizzadark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'awesome-pizza-theme';
  private readonly currentTheme = signal<AppTheme>('pizzalight');

  readonly theme = this.currentTheme.asReadonly();

  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const storedTheme = localStorage.getItem(this.storageKey);
    const preferredTheme: AppTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'pizzadark'
      : 'pizzalight';

    this.setTheme(storedTheme === 'pizzadark' || storedTheme === 'pizzalight' ? storedTheme : preferredTheme);
  }

  toggle(): void {
    this.setTheme(this.currentTheme() === 'pizzalight' ? 'pizzadark' : 'pizzalight');
  }

  private setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem(this.storageKey, theme);
  }
}
