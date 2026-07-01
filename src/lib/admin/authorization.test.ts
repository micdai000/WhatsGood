import { describe, expect, it } from "vitest";
import { DatabaseError } from "@/lib/errors";
import { adminListParamsSchema } from "@/lib/validators/admin";

describe("admin authorization inputs", () => {
  it("validates admin list params", () => {
    const result = adminListParamsSchema.safeParse({
      query: "designer",
      page: "2",
      limit: "50",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });
});

describe("DatabaseError", () => {
  it("sanitizes upstream database messages", () => {
    const error = DatabaseError.fromSource({
      message: 'duplicate key value violates unique constraint "profiles_username_key"',
    });

    expect(error.message).toBe("A database error occurred");
    expect(error.details).toMatchObject({
      sourceMessage: expect.stringContaining("duplicate key"),
    });
  });
});
