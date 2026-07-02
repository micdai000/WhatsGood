import { describe, expect, it } from "vitest";
import { isAdminRoute } from "@/lib/admin/routes";
import { isAuthRoute, isPublicRoute } from "@/lib/auth/routes";

describe("route guards", () => {
  describe("isPublicRoute", () => {
    it("allows marketing and auth pages", () => {
      expect(isPublicRoute("/")).toBe(true);
      expect(isPublicRoute("/search")).toBe(true);
      expect(isPublicRoute("/login")).toBe(true);
    });

    it("allows public profile and review pages", () => {
      expect(isPublicRoute("/@jane-doe")).toBe(true);
      expect(isPublicRoute("/u/jane-doe")).toBe(true);
      expect(isPublicRoute("/review/jane-doe")).toBe(true);
    });

    it("blocks dashboard routes", () => {
      expect(isPublicRoute("/dashboard")).toBe(false);
      expect(isPublicRoute("/admin")).toBe(false);
    });
  });

  describe("isAuthRoute", () => {
    it("identifies auth pages", () => {
      expect(isAuthRoute("/login")).toBe(true);
      expect(isAuthRoute("/dashboard")).toBe(false);
    });
  });

  describe("isAdminRoute", () => {
    it("identifies admin paths", () => {
      expect(isAdminRoute("/admin")).toBe(true);
      expect(isAdminRoute("/admin/users")).toBe(true);
      expect(isAdminRoute("/dashboard")).toBe(false);
    });
  });
});
