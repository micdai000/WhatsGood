import { describe, expect, it } from "vitest";
import { AuthorizationError } from "@/lib/errors";
import { toSerializableActionResult } from "@/lib/actions/serializable-result";
import { failure, success } from "@/services/shared";

describe("toSerializableActionResult", () => {
  it("serializes success results", () => {
    const result = toSerializableActionResult(success({ id: "123" }));
    expect(result).toEqual({ success: true, data: { id: "123" } });
  });

  it("serializes failure results without class instances", () => {
    const result = toSerializableActionResult(
      failure(new AuthorizationError("Administrator access required")),
    );

    expect(result).toEqual({
      success: false,
      message: "Administrator access required",
      code: "AUTHORIZATION_ERROR",
    });
  });
});
