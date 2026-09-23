export interface LoginRequestDto {
  readonly username: string;
  readonly password: string;
}

export interface LoginResponseDto {
  readonly accessToken?: string;
  readonly tokenType?: string;
  readonly expiresIn?: number;
}
