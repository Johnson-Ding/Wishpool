import { describe, expect, it } from "vitest";
import { getEnv } from "../config/env";

describe("getEnv", () => {
  it("parses required supabase configuration", () => {
    const env = getEnv({
      NODE_ENV: "test",
      PORT: "4010",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    });

    expect(env.PORT).toBe(4010);
    expect(env.SUPABASE_URL).toBe("https://example.supabase.co");
  });
});
