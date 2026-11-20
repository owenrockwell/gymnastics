import type {
  Apparatus,
  Compatibility,
  SourceReference,
  TransitionRule,
} from "../schemas";

export interface TransitionResult {
  compatibility: Compatibility;
  explanation: string;
  source?: SourceReference;
}

export function evaluateTransition(
  apparatus: Apparatus,
  fromElementId: string,
  toElementId: string,
  rules: readonly TransitionRule[],
): TransitionResult {
  const applicable = rules.filter(
    (rule) =>
      rule.apparatus === apparatus &&
      (rule.fromElementId === undefined ||
        rule.fromElementId === fromElementId) &&
      (rule.toElementId === undefined || rule.toElementId === toElementId),
  );

  if (applicable.length === 0) {
    return {
      compatibility: "unknown",
      explanation: "No explicit transition rule is available.",
    };
  }

  const specificity = (rule: TransitionRule) =>
    Number(rule.fromElementId !== undefined) +
    Number(rule.toElementId !== undefined);
  const mostSpecific = Math.max(...applicable.map(specificity));
  const selectedRules = applicable.filter(
    (rule) => specificity(rule) === mostSpecific,
  );
  const outcomes = new Set(selectedRules.map((rule) => rule.compatibility));

  if (outcomes.size !== 1) {
    return {
      compatibility: "unknown",
      explanation: "Conflicting transition rules require review.",
    };
  }

  const selected = selectedRules[0];
  return {
    compatibility: selected.compatibility,
    explanation: selected.explanation,
    source: selected.provenance.sources[0],
  };
}
