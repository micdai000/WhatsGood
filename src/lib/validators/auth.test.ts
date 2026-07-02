import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema, updatePasswordSchema } from "@/lib/validators/auth";

describe("auth validators", () => {
  describe("signUpSchema", () => {
    it("accepts valid signup input", () => {
      const result = signUpSchema.safeParse({
        email: "user@example.com",
        password: "password123",
        fullName: "Jane Doe",
      });

      expect(result.success).toBe(true);
    });

    it("rejects short passwords", () => {
      const result = signUpSchema.safeParse({
        email: "user@example.com",
        password: "short",
        fullName: "Jane Doe",
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const result = signUpSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        fullName: "Jane Doe",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("signInSchema", () => {
    it("requires password", () => {
      const result = signInSchema.safeParse({
        email: "user@example.com",
        password: "",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("requires matching passwords", () => {
      const result = updatePasswordSchema.safeParse({
        password: "password123",
        confirmPassword: "different",
      });

      expect(result.success).toBe(false);
    });
  });
});
