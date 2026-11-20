import type { ContactKind, PhysicalState } from "../schemas";

export type StateMatch = "match" | "mismatch" | "unknown";

function compareKnownValues(
  left: string | undefined,
  right: string | undefined,
): StateMatch {
  if (left === undefined || right === undefined) {
    return "unknown";
  }
  if (left === "unknown" || right === "unknown") {
    return "unknown";
  }
  return left === right ? "match" : "mismatch";
}

function compareContacts(
  left: ContactKind[],
  right: ContactKind[],
): StateMatch {
  if (left.includes("unknown") || right.includes("unknown")) {
    return "unknown";
  }

  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return leftSorted.join("|") === rightSorted.join("|") ? "match" : "mismatch";
}

export function matchPhysicalStates(
  exitState: PhysicalState,
  entryState: PhysicalState,
): StateMatch {
  const comparisons = [
    compareKnownValues(exitState.bodyOrientation, entryState.bodyOrientation),
    compareKnownValues(
      exitState.bodyConfiguration,
      entryState.bodyConfiguration,
    ),
    compareKnownValues(exitState.support, entryState.support),
    compareContacts(exitState.contacts, entryState.contacts),
    compareKnownValues(exitState.swingPhase, entryState.swingPhase),
    compareKnownValues(exitState.grip.type, entryState.grip.type),
    compareKnownValues(exitState.grip.handContact, entryState.grip.handContact),
    compareKnownValues(exitState.grip.leftHand, entryState.grip.leftHand),
    compareKnownValues(exitState.grip.rightHand, entryState.grip.rightHand),
  ];

  if (comparisons.includes("mismatch")) {
    return "mismatch";
  }
  return comparisons.includes("unknown") ? "unknown" : "match";
}
