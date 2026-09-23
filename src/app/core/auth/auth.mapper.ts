import { LoginResponseDto } from './auth-api.dto';
import { AuthSession } from './auth.models';

export function mapAuthSession(response: LoginResponseDto, username: string): AuthSession {
  if (!response.accessToken) throw new Error('Missing access token');

  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType || 'Bearer',
    expiresAt: response.expiresIn ? Date.now() + response.expiresIn * 1000 : null,
    username,
  };
}
