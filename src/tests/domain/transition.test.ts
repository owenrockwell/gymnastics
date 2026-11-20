import { describe, expect, it } from "vitest";
import { evaluateTransition } from "../../domain/transitions/evaluate-transition";
import { fictionalTransitionRules } from "../../data/fictional-fixture";

describe("evaluateTransition", () => {
  it("returns an explicit transition result", () => {
    expect(
      evaluateTransition(
        "HB",
        "fixture-hb-a",
        "fixture-hb-b",
        fictionalTransitionRules,
      ),
    ).toMatchObject({
      compatibility: "compatible",
      explanation: "Fictional fixture rule used to exercise the evaluator.",
    });
  });

  it("keeps transitions without a matching rule unknown", () => {
    expect(
      evaluateTransition("HB", "fixture-hb-b", "fixture-hb-a", []),
    ).toEqual({
      compatibility: "unknown",
      explanation: "No explicit transition rule is available.",
    });
  });
});
