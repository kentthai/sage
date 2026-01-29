import type { User } from '@sage/shared';

/**
 * Authentication provider interface.
 * Implementations: JWT, session-based, OAuth, etc.
 */
export interface IAuthProvider {
  /**
   * Authenticate user with credentials
   */
  authenticate(
    credentials: AuthCredentials
  ): Promise<AuthResult>;

  /**
   * Verify a token and return user info
   */
  verifyToken(token: string): Promise<TokenPayload | null>;

  /**
   * Refresh an access token
   */
  refreshToken(refreshToken: string): Promise<TokenPair>;

  /**
   * Revoke a token (logout)
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Revoke all tokens for a user
   */
  revokeAllTokens(userId: string): Promise<void>;

  /**
   * Generate password reset token
   */
  generateResetToken(email: string): Promise<string>;

  /**
   * Verify password reset token
   */
  verifyResetToken(token: string): Promise<string | null>; // returns userId

  /**
   * Hash a password
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verify a password against hash
   */
  verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean>;

  /**
   * Generate API key for a user
   */
  generateApiKey(userId: string, name: string): Promise<ApiKey>;

  /**
   * Verify API key and return user info
   */
  verifyApiKey(key: string): Promise<ApiKeyPayload | null>;

  /**
   * Revoke an API key
   */
  revokeApiKey(keyId: string): Promise<void>;

  /**
   * List API keys for a user
   */
  listApiKeys(userId: string): Promise<ApiKeyInfo[]>;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: TokenPair;
  error?: AuthError;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export type AuthError =
  | 'invalid_credentials'
  | 'user_not_found'
  | 'account_disabled'
  | 'token_expired'
  | 'token_invalid';

export interface ApiKey {
  id: string;
  key: string; // only returned on creation
  name: string;
  createdAt: Date;
}

export interface ApiKeyPayload {
  userId: string;
  keyId: string;
  name: string;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  createdAt: Date;
  lastUsedAt?: Date;
}
