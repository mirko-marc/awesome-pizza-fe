import { mapAuthSession } from './auth.mapper';

describe('auth mapper', () => {
  it('maps all fields from the documented login response', () => {
    const now = 1_800_000_000_000;
    spyOn(Date, 'now').and.returnValue(now);

    expect(
      mapAuthSession(
        { accessToken: 'jwt-token', tokenType: 'Bearer', expiresIn: 3600 },
        'pizzaiolo',
      ),
    ).toEqual({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresAt: now + 3_600_000,
      username: 'pizzaiolo',
    });
  });

  it('rejects a login response without an access token', () => {
    expect(() => mapAuthSession({}, 'pizzaiolo')).toThrowError('Missing access token');
  });
});
