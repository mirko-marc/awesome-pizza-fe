import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { LoginRequestDto } from './auth-api.dto';
import { mapAuthSession } from './auth.mapper';
import { AuthSession } from './auth.models';
import { AuthSessionStorage } from './auth-session.storage';

interface AuthState {
  readonly session: AuthSession | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: AuthState = {
  session: null,
  isLoading: false,
  error: null,
};

function loginErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Non è stato possibile effettuare l’accesso.';
  if (error.status === 0) return 'Il servizio di autenticazione non è raggiungibile.';
  if (error.status === 401) return 'Nome utente o password non corretti.';
  return 'Non è stato possibile effettuare l’accesso.';
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ session }) => ({
    isAuthenticated: computed(() => session() !== null),
    accessToken: computed(() => session()?.accessToken ?? null),
    tokenType: computed(() => session()?.tokenType ?? 'Bearer'),
    username: computed(() => session()?.username ?? null),
  })),
  withMethods(
    (
      store,
      api = inject(AuthApiService),
      storage = inject(AuthSessionStorage),
    ) => ({
      hydrate(): void {
        patchState(store, { session: storage.read() });
      },

      async login(credentials: LoginRequestDto): Promise<boolean> {
        patchState(store, { isLoading: true, error: null });
        try {
          const response = await firstValueFrom(api.login(credentials));
          const session: AuthSession = mapAuthSession(response, credentials.username);
          storage.write(session);
          patchState(store, { session, isLoading: false });
          return true;
        } catch (error: unknown) {
          patchState(store, { isLoading: false, error: loginErrorMessage(error) });
          return false;
        }
      },

      logout(): void {
        storage.clear();
        patchState(store, { session: null, error: null });
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    }),
  ),
  withHooks({
    onInit(store) {
      store.hydrate();
    },
  }),
);
