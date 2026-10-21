import { describe, expect, it } from "vitest";
import { fitWithin } from "@/lib/profile/normalize-photo";

describe("fitWithin", () => {
  it("keeps smaller images unchanged", () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it("scales phone photos down to the longest edge", () => {
    expect(fitWithin(4032, 3024, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it("handles portrait library photos", () => {
    expect(fitWithin(3024, 4032, 1600)).toEqual({ width: 1200, height: 1600 });
  });
});
