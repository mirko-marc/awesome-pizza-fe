import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthSession } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthSessionStorage {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'awesome-pizza-admin-session';

  read(): AuthSession | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const serializedSession = sessionStorage.getItem(this.storageKey);
    if (!serializedSession) return null;

    try {
      const session = JSON.parse(serializedSession) as Partial<AuthSession>;
      const isExpired = typeof session.expiresAt === 'number' && session.expiresAt <= Date.now();
      if (!session.accessToken || !session.username || isExpired) {
        this.clear();
        return null;
      }

      return {
        accessToken: session.accessToken,
        tokenType: session.tokenType || 'Bearer',
        expiresAt: session.expiresAt ?? null,
        username: session.username,
      };
    } catch {
      this.clear();
      return null;
    }
  }

  write(session: AuthSession): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.storageKey, JSON.stringify(session));
    }
  }

  clear(): void {
    if (isPlatformBrowser(this.platformId)) sessionStorage.removeItem(this.storageKey);
  }
}
