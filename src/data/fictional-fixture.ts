import {
  elementRecordSchema,
  rulesetSchema,
  transitionRuleSchema,
} from "../domain/schemas";

const fixtureProvenance = {
  status: "unverified" as const,
  sources: [],
  notes: "Fictional test data only; not an official gymnastics record.",
};

const stillSupport = {
  bodyOrientation: "upright" as const,
  bodyConfiguration: "straight" as const,
  support: "hand-support" as const,
  contacts: ["hands"] as const,
  swingPhase: "static" as const,
  grip: {
    type: "overgrip" as const,
    handContact: "two" as const,
  },
};

export const fictionalElements = [
  elementRecordSchema.parse({
    id: "fixture-hb-a",
    apparatus: "HB",
    officialIdentifier: "FIXTURE-HB-A",
    officialName: "Fictional fixture movement A",
    officialDescription: "Fictional test fixture; not a real FIG element.",
    searchTerms: ["fixture", "fictional"],
    difficulty: {
      letter: "A",
      numericValue: 0,
      rulesetId: "fictional-mag-fixture",
    },
    elementGroups: [],
    movement: { travelDirection: "none", rotationDirection: "none" },
    phases: [
      {
        index: 0,
        label: "Fixture support",
        start: stillSupport,
        end: stillSupport,
        movement: { direction: "none" },
        actions: ["Fictional fixture phase"],
        isFlight: false,
      },
    ],
    transitionEndpoints: [
      {
        endpointId: "fixture-hb-a-exit",
        kind: "exit",
        state: stillSupport,
        movement: { direction: "none" },
      },
    ],
    restrictions: [],
    provenance: fixtureProvenance,
  }),
  elementRecordSchema.parse({
    id: "fixture-hb-b",
    apparatus: "HB",
    officialIdentifier: "FIXTURE-HB-B",
    officialName: "Fictional fixture movement B",
    officialDescription: "Fictional test fixture; not a real FIG element.",
    searchTerms: ["fixture", "fictional"],
    difficulty: {
      letter: "A",
      numericValue: 0,
      rulesetId: "fictional-mag-fixture",
    },
    elementGroups: [],
    movement: { travelDirection: "none", rotationDirection: "none" },
    phases: [
      {
        index: 0,
        label: "Fixture support",
        start: stillSupport,
        end: stillSupport,
        movement: { direction: "none" },
        actions: ["Fictional fixture phase"],
        isFlight: false,
      },
    ],
    transitionEndpoints: [
      {
        endpointId: "fixture-hb-b-entry",
        kind: "entry",
        state: stillSupport,
        movement: { direction: "none" },
      },
    ],
    restrictions: [],
    provenance: fixtureProvenance,
  }),
];

export const fictionalTransitionRules = [
  transitionRuleSchema.parse({
    id: "fixture-transition-a-to-b",
    apparatus: "HB",
    fromElementId: "fixture-hb-a",
    toElementId: "fixture-hb-b",
    compatibility: "compatible",
    constraints: [],
    explanation: "Fictional fixture rule used to exercise the evaluator.",
    provenance: fixtureProvenance,
  }),
];

export const fictionalRuleset = rulesetSchema.parse({
  id: "fictional-mag-fixture",
  name: "Fictional MAG test ruleset",
  cycle: "2025-2028",
  version: "fixture-0.1.0",
  sourceDocuments: [],
  effectiveFrom: "2025-01-01",
  amendments: [],
  routinePolicies: {},
});
