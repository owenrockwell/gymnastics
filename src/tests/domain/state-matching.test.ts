import { describe, expect, it } from "vitest";
import { matchPhysicalStates } from "../../domain/movement/state-matching";
import { knownSupportState, unknownMovementState } from "../fixtures/movement";

describe("matchPhysicalStates", () => {
  it("matches equal known physical states", () => {
    expect(matchPhysicalStates(knownSupportState, knownSupportState)).toBe(
      "match",
    );
  });

  it("does not treat unknown state data as a match", () => {
    expect(matchPhysicalStates(knownSupportState, unknownMovementState)).toBe(
      "unknown",
    );
  });

  it("distinguishes known absence from unknown support", () => {
    expect(
      matchPhysicalStates(
        { ...knownSupportState, support: "none" },
        { ...knownSupportState, support: "unknown" },
      ),
    ).toBe("unknown");
  });

  it("reports a mismatch when known support values differ", () => {
    expect(
      matchPhysicalStates(knownSupportState, {
        ...knownSupportState,
        support: "forearm-support",
      }),
    ).toBe("mismatch");
  });
});
