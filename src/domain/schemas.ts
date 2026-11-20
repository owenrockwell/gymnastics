import { z } from "zod";

export const APPARATUSES = ["FX", "PH", "SR", "VT", "PB", "HB"] as const;
export const apparatusSchema = z.enum(APPARATUSES);
export type Apparatus = z.infer<typeof apparatusSchema>;

export const verificationStatusSchema = z.enum([
  "unverified",
  "machine-extracted",
  "expert-reviewed",
  "officially-confirmed",
]);
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const sourceReferenceSchema = z.object({
  documentId: z.string(),
  documentVersion: z.string(),
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
  tableOrElementNumber: z.string().optional(),
  sourceText: z.string().optional(),
  sourceUrl: z.string().url().optional(),
});
export type SourceReference = z.infer<typeof sourceReferenceSchema>;

export const provenanceSchema = z.object({
  status: verificationStatusSchema,
  sources: z.array(sourceReferenceSchema),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});
export type Provenance = z.infer<typeof provenanceSchema>;

export const difficultyLetterSchema = z.enum([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
]);

export const difficultyValueSchema = z.object({
  letter: difficultyLetterSchema,
  numericValue: z.number().nonnegative(),
  rulesetId: z.string().min(1),
});

export const bodyConfigurationSchema = z.enum([
  "straight",
  "tucked",
  "piked",
  "straddled",
  "mixed",
  "other",
  "unknown",
]);
export type BodyConfiguration = z.infer<typeof bodyConfigurationSchema>;

export const bodyOrientationSchema = z.enum([
  "upright",
  "inverted",
  "horizontal",
  "rotating",
  "airborne",
  "unknown",
]);
export type BodyOrientation = z.infer<typeof bodyOrientationSchema>;

export const supportKindSchema = z.enum([
  "hand-support",
  "upper-arm-support",
  "forearm-support",
  "foot-support",
  "mixed-support",
  "none",
  "unknown",
]);

export const contactKindSchema = z.enum([
  "hands",
  "forearms",
  "upper-arms",
  "feet",
  "legs",
  "body",
  "no-contact",
  "unknown",
]);
export type ContactKind = z.infer<typeof contactKindSchema>;

export const swingPhaseSchema = z.enum([
  "static",
  "forward-swing",
  "backward-swing",
  "bottom-of-swing",
  "upswing",
  "downswing",
  "release",
  "flight",
  "catch",
  "transition",
  "unknown",
]);
export type SwingPhase = z.infer<typeof swingPhaseSchema>;

export const movementDirectionSchema = z.enum([
  "forward",
  "backward",
  "left",
  "right",
  "clockwise",
  "counterclockwise",
  "longitudinal-twist",
  "lateral",
  "multi-axis",
  "none",
  "unknown",
]);
export type MovementDirection = z.infer<typeof movementDirectionSchema>;

export const gripTypeSchema = z.enum([
  "overgrip",
  "undergrip",
  "mixed-grip",
  "cross-grip",
  "L-grip",
  "reverse-grip",
  "one-hand",
  "two-hand",
  "other",
  "not-applicable",
  "unknown",
]);

export const gripStateSchema = z.object({
  type: gripTypeSchema,
  leftHand: gripTypeSchema.optional(),
  rightHand: gripTypeSchema.optional(),
  handContact: z.enum(["one", "two", "none", "unknown"]),
  orientation: z.string().optional(),
});

export const physicalStateSchema = z.object({
  bodyOrientation: bodyOrientationSchema,
  bodyConfiguration: bodyConfigurationSchema,
  support: supportKindSchema,
  contacts: z.array(contactKindSchema),
  swingPhase: swingPhaseSchema,
  grip: gripStateSchema,
  apparatusPosition: z.string().optional(),
  notes: z.string().optional(),
});
export type PhysicalState = z.infer<typeof physicalStateSchema>;

export const movementVectorSchema = z.object({
  direction: movementDirectionSchema,
  rotationDegrees: z.number().optional(),
  twistDegrees: z.number().optional(),
  axis: z
    .enum(["longitudinal", "transverse", "lateral", "multiple"])
    .optional(),
});

export const movementProfileSchema = z.object({
  travelDirection: movementDirectionSchema.optional(),
  rotationDirection: movementDirectionSchema.optional(),
  notes: z.string().optional(),
});

export const movementPhaseSchema = z.object({
  index: z.number().int().nonnegative(),
  label: z.string().min(1),
  start: physicalStateSchema,
  end: physicalStateSchema,
  movement: movementVectorSchema,
  actions: z.array(z.string()),
  isFlight: z.boolean(),
});
export type MovementPhase = z.infer<typeof movementPhaseSchema>;

export const transitionEndpointSchema = z.object({
  endpointId: z.string().min(1),
  kind: z.enum(["entry", "exit", "intermediate"]),
  state: physicalStateSchema,
  movement: movementVectorSchema,
});

export const elementRestrictionSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
  ruleId: z.string().optional(),
  severity: z.enum(["info", "warning", "blocking"]),
});

export const elementIllustrationSchema = z.object({
  assetPath: z.string(),
  source: sourceReferenceSchema,
  verificationStatus: verificationStatusSchema,
  altText: z.string(),
  cropDescription: z.string().optional(),
});

export const elementRecordSchema = z.object({
  id: z.string().min(1),
  apparatus: apparatusSchema,
  officialIdentifier: z.string().min(1),
  officialName: z.string().optional(),
  officialDescription: z.string(),
  searchTerms: z.array(z.string()),
  difficulty: difficultyValueSchema,
  elementGroups: z.array(z.string()),
  movement: movementProfileSchema,
  phases: z.array(movementPhaseSchema),
  transitionEndpoints: z.array(transitionEndpointSchema),
  restrictions: z.array(elementRestrictionSchema),
  illustration: elementIllustrationSchema.optional(),
  provenance: provenanceSchema,
});
export type ElementRecord = z.infer<typeof elementRecordSchema>;

export const compatibilitySchema = z.enum([
  "compatible",
  "conditional",
  "incompatible",
  "unknown",
]);
export type Compatibility = z.infer<typeof compatibilitySchema>;

export const transitionConstraintSchema = z.object({
  field: z.string(),
  operator: z.enum(["equals", "in", "not-equals", "requires"]),
  value: z.unknown(),
  description: z.string(),
});

export const transitionRuleSchema = z.object({
  id: z.string().min(1),
  apparatus: apparatusSchema,
  fromElementId: z.string().optional(),
  toElementId: z.string().optional(),
  compatibility: compatibilitySchema,
  constraints: z.array(transitionConstraintSchema),
  explanation: z.string(),
  provenance: provenanceSchema,
});
export type TransitionRule = z.infer<typeof transitionRuleSchema>;

export const requirementStatusSchema = z.enum([
  "satisfied",
  "outstanding",
  "needs-verification",
  "not-applicable",
]);
export type RequirementStatus = z.infer<typeof requirementStatusSchema>;

export const routinePolicySchema = z.object({
  maxSelectedElements: z.number().int().positive(),
  maxCountingElements: z.number().int().positive().optional(),
  countingPolicyId: z.string(),
  requirementRuleIds: z.array(z.string()),
});

export const rulesetSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  cycle: z.literal("2025-2028"),
  version: z.string(),
  sourceDocuments: z.array(sourceReferenceSchema),
  effectiveFrom: z.string(),
  amendments: z.array(z.string()),
  routinePolicies: z
    .object({
      FX: routinePolicySchema.optional(),
      PH: routinePolicySchema.optional(),
      SR: routinePolicySchema.optional(),
      VT: routinePolicySchema.optional(),
      PB: routinePolicySchema.optional(),
      HB: routinePolicySchema.optional(),
    })
    .strict(),
});
export type Ruleset = z.infer<typeof rulesetSchema>;

export const datasetManifestSchema = z.object({
  schemaVersion: z.string(),
  datasetVersion: z.string(),
  rulesetId: z.string(),
  generatedAt: z.string().datetime(),
  elementCountByApparatus: z
    .object({
      FX: z.number().int().nonnegative().optional(),
      PH: z.number().int().nonnegative().optional(),
      SR: z.number().int().nonnegative().optional(),
      VT: z.number().int().nonnegative().optional(),
      PB: z.number().int().nonnegative().optional(),
      HB: z.number().int().nonnegative().optional(),
    })
    .strict(),
  sourceDocuments: z.array(sourceReferenceSchema),
});
export type DatasetManifest = z.infer<typeof datasetManifestSchema>;

export const routineSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  apparatus: apparatusSchema,
  rulesetId: z.string(),
  datasetVersion: z.string(),
  elements: z.array(
    z.object({
      instanceId: z.string().min(1),
      elementId: z.string().min(1),
      order: z.number().int().nonnegative(),
      notes: z.string().optional(),
    }),
  ),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Routine = z.infer<typeof routineSchema>;
