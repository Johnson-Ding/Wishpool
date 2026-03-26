import { describe, expect, it } from "vitest";
import { advanceDemoFlow, createDemoFlowState, startScenarioDemoFlow } from "../flow-state";

describe("demo flow state", () => {
  it("keeps the selected scenario while advancing through the flow", () => {
    const started = startScenarioDemoFlow(createDemoFlowState("home", 1), 4, "ai-plan");

    expect(started.currentScreen).toBe("ai-plan");
    expect(started.scenarioId).toBe(4);

    const advanced = advanceDemoFlow(started);

    expect(advanced.currentScreen).toBe("round-update");
    expect(advanced.scenarioId).toBe(4);
  });
});
