import type { PhysicalState } from "../../domain/schemas";

export const knownSupportState: PhysicalState = {
  bodyOrientation: "upright",
  bodyConfiguration: "straight",
  support: "hand-support",
  contacts: ["hands"],
  swingPhase: "static",
  grip: {
    type: "overgrip",
    handContact: "two",
    leftHand: "overgrip",
    rightHand: "overgrip",
  },
};

export const unknownMovementState: PhysicalState = {
  ...knownSupportState,
  bodyOrientation: "unknown",
  support: "unknown",
  contacts: ["unknown"],
  swingPhase: "unknown",
  grip: {
    type: "unknown",
    handContact: "unknown",
  },
};
