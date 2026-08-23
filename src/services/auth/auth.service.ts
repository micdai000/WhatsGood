import type { EmailOtpType, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { mapSupabaseUser } from "@/lib/auth/map-user";
import { mapUnknownAuthError } from "@/lib/auth/map-auth-error";
import { getAuthCallbackUrl } from "@/lib/auth/routes";
import { logger } from "@/lib/logger";
import { failure, handleServiceError, success } from "@/services/shared";
import type {
  AuthSession,
  AuthUser,
  ResetPasswordInput,
  ServiceResult,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
} from "@/types";
import { isSuccess } from "@/types";

export class AuthService {
  private getClient(): SupabaseClient {
    return createClient();
  }

  private mapSession(
    user: AuthUser,
    expiresAt?: number | null,
  ): AuthSession {
    return {
      user,
      expiresAt: expiresAt ?? null,
    };
  }

  async signUp(input: SignUpInput): Promise<ServiceResult<AuthUser>> {
    const method = "AuthService.signUp";

    try {
      const supabase = this.getClient();
      const emailRedirectTo = getAuthCallbackUrl();
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { full_name: input.fullName },
          emailRedirectTo,
        },
      });

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      if (!data.user) {
        return failure(
          mapUnknownAuthError(new Error("Sign up failed. Please try again.")),
        );
      }

      const mapped = mapSupabaseUser(data.user);
      const isDuplicatePlaceholder =
        !data.session && (data.user.identities?.length ?? 0) === 0;

      // Existing unconfirmed accounts get a fake success and no email. Resend so they still get a live-site link.
      if (isDuplicatePlaceholder && !mapped.emailVerified) {
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email: input.email,
          options: { emailRedirectTo },
        });
        if (resendError) {
          logger.info(method, { resendSkipped: resendError.message });
        }
      }

      // Do not keep users signed in before they choose to log in.
      if (data.session) {
        await supabase.auth.signOut();
      }

      logger.info(method, {
        userId: data.user.id,
        emailVerified: mapped.emailVerified,
      });
      return success(mapped);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async signIn(input: SignInInput): Promise<ServiceResult<AuthSession>> {
    const method = "AuthService.signIn";

    try {
      const supabase = this.getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      if (!data.user || !data.session) {
        return failure(
          mapUnknownAuthError(new Error("Sign in failed. Please try again.")),
        );
      }

      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return failure(
          mapUnknownAuthError(
            new Error("Please verify your email before signing in."),
          ),
        );
      }

      logger.info(method, { userId: data.user.id });
      return success(
        this.mapSession(
          mapSupabaseUser(data.user),
          data.session.expires_at ?? null,
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async signOut(): Promise<ServiceResult<void>> {
    const method = "AuthService.signOut";

    try {
      const supabase = this.getClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      logger.info(method);
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async resetPassword(
    input: ResetPasswordInput,
  ): Promise<ServiceResult<void>> {
    const method = "AuthService.resetPassword";

    try {
      const supabase = this.getClient();
      const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: getAuthCallbackUrl(),
      });

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      logger.info(method, { email: input.email });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async resendSignupEmail(email: string): Promise<ServiceResult<void>> {
    const method = "AuthService.resendSignupEmail";

    try {
      const supabase = this.getClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: getAuthCallbackUrl() },
      });

      if (error) {
        logger.info(method, { email, skipped: error.message });
      }

      logger.info(method, { email });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async updatePassword(
    input: UpdatePasswordInput,
  ): Promise<ServiceResult<void>> {
    const method = "AuthService.updatePassword";

    try {
      const supabase = this.getClient();
      const { error } = await supabase.auth.updateUser({
        password: input.password,
      });

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      logger.info(method);
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async verifyEmail(
    tokenHash: string,
    type: EmailOtpType = "email",
  ): Promise<ServiceResult<AuthUser>> {
    const method = "AuthService.verifyEmail";

    try {
      const supabase = this.getClient();
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      if (!data.user) {
        return failure(
          mapUnknownAuthError(new Error("Email verification failed.")),
        );
      }

      // Verification confirms email but does not auto-login.
      if (data.session) {
        await supabase.auth.signOut();
      }

      logger.info(method, { userId: data.user.id });
      return success(mapSupabaseUser(data.user));
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getCurrentUser(): Promise<ServiceResult<AuthUser | null>> {
    const method = "AuthService.getCurrentUser";

    try {
      const supabase = this.getClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      return success(user ? mapSupabaseUser(user) : null);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async getSession(): Promise<ServiceResult<AuthSession | null>> {
    const method = "AuthService.getSession";

    try {
      const supabase = this.getClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      if (!session?.user) {
        return success(null);
      }

      if (!session.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return success(null);
      }

      return success(
        this.mapSession(
          mapSupabaseUser(session.user),
          session.expires_at ?? null,
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async deleteAccount(): Promise<ServiceResult<void>> {
    const method = "AuthService.deleteAccount";

    try {
      const sessionResult = await this.getSession();

      if (!isSuccess(sessionResult) || !sessionResult.data) {
        return failure(
          mapUnknownAuthError(new Error("You must be signed in to delete your account")),
        );
      }

      const userId = sessionResult.data.user.id;
      const supabase = this.getClient();

      const { error } = await supabase.rpc("delete_own_account");

      if (error) {
        logger.error(method, error, { userId });
        return failure(mapUnknownAuthError(error));
      }

      await supabase.auth.signOut();
      logger.info(method, { userId });
      return success(undefined);
    } catch (error) {
      return handleServiceError(method, error);
    }
  }

  async refreshSession(): Promise<ServiceResult<AuthSession | null>> {
    const method = "AuthService.refreshSession";

    try {
      const supabase = this.getClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error) {
        logger.error(method, error);
        return failure(mapUnknownAuthError(error));
      }

      if (!session?.user) {
        return success(null);
      }

      if (!session.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return success(null);
      }

      return success(
        this.mapSession(
          mapSupabaseUser(session.user),
          session.expires_at ?? null,
        ),
      );
    } catch (error) {
      return handleServiceError(method, error);
    }
  }
}

export const authService = new AuthService();
