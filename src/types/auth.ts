export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: number | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface UpdatePasswordInput {
  password: string;
}
