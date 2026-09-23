export interface AuthSession {
  readonly accessToken: string;
  readonly tokenType: string;
  readonly expiresAt: number | null;
  readonly username: string;
}
