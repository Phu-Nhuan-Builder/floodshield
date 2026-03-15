// Worker unit tests — response utilities
import { describe, it, expect } from "vitest";
import { ok, err } from "../utils/response";

describe("response helpers", () => {
  it("ok wraps data with null error", () => {
    const result = ok({ hello: "world" });
    expect(result.data).toEqual({ hello: "world" });
    expect(result.error).toBeNull();
    expect(result.timestamp).toBeDefined();
  });

  it("err wraps error with null data", () => {
    const result = err("NOT_FOUND", "Zone not found");
    expect(result.data).toBeNull();
    expect(result.error.code).toBe("NOT_FOUND");
    expect(result.error.message).toBe("Zone not found");
    expect(result.timestamp).toBeDefined();
  });
});
