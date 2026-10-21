import { describe, expect, it } from "vitest";
import type { User } from "@supabase/supabase-js";
import { mapSupabaseUser } from "@/lib/auth/map-user";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    email: "jane@example.com",
    email_confirmed_at: "2026-01-01T00:00:00Z",
    user_metadata: {},
    app_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
    ...overrides,
  } as User;
}

describe("mapSupabaseUser", () => {
  it("maps the signup full name instead of dropping it", () => {
    const user = mapSupabaseUser(
      makeUser({
        user_metadata: { full_name: "Jane Doe" },
      }),
    );

    expect(user.fullName).toBe("Jane Doe");
    expect(user.email).toBe("jane@example.com");
    expect(user.emailVerified).toBe(true);
  });

  it("reads avatar metadata when present", () => {
    const user = mapSupabaseUser(
      makeUser({
        user_metadata: {
          full_name: "Jane Doe",
          avatar_url: "https://cdn.example.com/jane.jpg",
        },
      }),
    );

    expect(user.avatarUrl).toBe("https://cdn.example.com/jane.jpg");
  });

  it("treats blank metadata as missing", () => {
    const user = mapSupabaseUser(
      makeUser({
        user_metadata: { full_name: "   ", avatar_url: "" },
      }),
    );

    expect(user.fullName).toBeNull();
    expect(user.avatarUrl).toBeNull();
  });
});
