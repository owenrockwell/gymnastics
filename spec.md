# Gymnastics Routine Planner

## Product Intent, Architecture, Functional Specification and Requirements

**Document status:** Agent implementation brief\
**Product:** Men's Artistic Gymnastics Routine Planner\
**Ruleset target:** FIG Men's Artistic Gymnastics Code of Points
2025--2028\
**Initial platform:** Browser-based web application\
**Initial audience:** Senior competitive gymnasts and coaches

------------------------------------------------------------------------

## 1. Product intent

Build a browser-based application that helps men's artistic gymnasts and
coaches explore FIG-recognised elements, assemble routines, understand
movement transitions, receive next-element suggestions, and track
routine composition and difficulty requirements.

The application is a planning and reference tool. It is not an automated
judge and must not present inferred movement compatibility, element
recognition, or scoring outcomes as official determinations.

The central user workflow is:

1.  Select an apparatus.
2.  Browse and search its element catalogue.
3.  Inspect an element's official description, difficulty, group,
    illustration (when available), movement characteristics, and source
    references.
4.  Add up to ten elements to a draft routine where sequence-based
    planning applies.
5.  Receive suggestions for possible next elements based on the previous
    element's exit state, movement direction, swing phase, grip, and
    current routine requirements.
6.  See composition requirements and applicable difficulty/counting
    information update as the routine changes.
7.  Save, reopen, and export routines.

### Product principles

-   **Accuracy before completeness:** incomplete or uncertain data must
    be labelled, not guessed.
-   **Explainability:** every recommendation, warning, and requirement
    result should explain why it was produced.
-   **Ruleset awareness:** all scoring and composition logic must be
    tied to an explicit ruleset version.
-   **Separation of concerns:** element facts, movement mechanics,
    transition compatibility, and scoring rules are distinct concepts.
-   **Coach oversight:** the application supports expert
    decision-making; it does not replace coaches or judges.
-   **Local-first MVP:** routine data is stored in the browser; no
    account or backend is required initially.
-   **Accessible interface:** keyboard operation, clear focus, semantic
    structure, and readable status information are required.

------------------------------------------------------------------------

## 2. Scope

### 2.1 In scope

-   Men's Artistic Gymnastics (MAG).
-   FIG senior Code of Points 2025--2028 as the initial ruleset.
-   All six apparatuses:
    -   FX --- Floor exercise
    -   PH --- Pommel horse
    -   SR --- Still rings
    -   VT --- Vault
    -   PB --- Parallel bars
    -   HB --- Horizontal bar
-   Element catalogue with structured metadata.
-   Element detail view.
-   Detailed movement model, including states, movement direction,
    movement phases, swing phase, and grip where relevant.
-   Routine builder for sequence-based apparatuses.
-   User-configurable routine drafts, with a default maximum of ten
    selected elements.
-   Transition compatibility analysis and next-element recommendations.
-   Requirement tracking and difficulty/counting summaries based on
    implemented, verified rules.
-   Local persistence using IndexedDB.
-   Routine import/export.
-   Dataset and ruleset version awareness.
-   Clear provenance and verification status for catalogue and rules
    data.

### 2.2 Out of scope for the MVP

-   PDF ingestion or automated Code of Points extraction.
-   Automatic video analysis or pose estimation.
-   Automatic judging of execution, form, amplitude, landing, or
    deductions.
-   Claiming official FIG score certification.
-   Cloud accounts, authentication, synchronisation, and collaboration.
-   Social features, public routine sharing, or coaching chat.
-   Native mobile applications.
-   Generative AI inventing elements, transitions, or rules.
-   Treating all six apparatuses as identical routine-building
    workflows.

### 2.3 Vault distinction

Vault is not a conventional sequence of up to ten routine elements. It
must have a dedicated planning and detail workflow based on the
applicable vault rules. It may share catalogue, source, and ruleset
infrastructure, but must not be forced into the sequence builder.

------------------------------------------------------------------------

## 3. Users and primary use cases

### Primary users

**Senior competitive gymnast** - Wants to explore elements and assemble
a possible routine. - Wants to understand what can logically follow a
selected element. - Wants to identify missing composition
requirements. - Wants to compare alternative routine constructions.

**Coach** - Wants to inspect element details and source references. -
Wants to build, review, and revise routines. - Wants recommendations
with explicit reasoning and confidence. - Wants to distinguish verified
information from assumptions.

### Core user stories

1.  As a user, I can select one of the six MAG apparatuses.
2.  As a user, I can search and filter the apparatus's element
    catalogue.
3.  As a user, I can inspect an element's official description,
    difficulty, group, movement phases, entry/exit states, and
    provenance.
4.  As a user, I can add an element to a routine and see it in sequence
    order.
5.  As a user, I can remove and reorder routine elements.
6.  As a user, I cannot exceed the routine's configured selection limit.
7.  As a user, I can see the previous element's exit mechanics and the
    next element's entry mechanics.
8.  As a user, I can receive ranked suggestions for possible next
    elements.
9.  As a user, I can see why an element was suggested.
10. As a user, I can see whether a transition is compatible,
    conditional, incompatible, or unknown.
11. As a user, I can see composition requirements update when the
    routine changes.
12. As a user, I can see selected elements separately from elements that
    count under the active rules.
13. As a user, I can see which requirements are satisfied, outstanding,
    not applicable, or need verification.
14. As a user, I can save and reopen multiple routines.
15. As a user, I can export and import a routine.
16. As a user, I can identify the ruleset and dataset version used to
    evaluate a routine.

------------------------------------------------------------------------

## 4. Product behaviour and UX

### 4.1 Main navigation

Provide the following top-level areas:

-   **Apparatus:** select FX, PH, SR, VT, PB, or HB.
-   **Element catalogue:** search, filter, and inspect elements for the
    selected apparatus.
-   **Routine builder:** create and edit routines for sequence-based
    apparatuses.
-   **Saved routines:** list, reopen, duplicate, rename, export, and
    delete local routines.
-   **Rules and information:** show active ruleset version, dataset
    version, limitations, and source references.

The interface should be responsive and usable on desktop, tablet, and
mobile browsers. Desktop may use a two-panel layout with the routine
alongside the catalogue. On smaller screens, use separate or collapsible
panels.

### 4.2 Element catalogue

Catalogue capabilities:

-   Filter by apparatus.
-   Search official name, description, identifier, and search terms.
-   Filter by difficulty.
-   Filter by element group.
-   Filter by entry state, exit state, direction, swing phase, support,
    and grip where data exists.
-   Show an image/illustration when a verified asset is available.
-   Show official description and source reference.
-   Display verification status.
-   Clearly mark missing or uncertain movement metadata.

Do not hide an element merely because optional movement metadata is
incomplete. Allow it to appear in search, but prevent unsupported claims
about its transitions.

### 4.3 Element detail

An element detail view should show:

-   Apparatus.
-   Official identifier.
-   Official name, if available.
-   Official description.
-   Difficulty value and letter, tied to the ruleset.
-   Element group or groups.
-   Illustration, if available.
-   Ordered movement phases.
-   Entry and exit endpoints.
-   Body orientation and configuration.
-   Support and contact information.
-   Swing phase.
-   Grip, including per-hand details where relevant.
-   Movement direction and rotation information where known.
-   Restrictions and special notes.
-   Source page/section and verification status.

### 4.4 Routine builder

For FX, PH, SR, PB, and HB:

-   Create a named routine.
-   Add elements from the catalogue.
-   Display elements in sequence order.
-   Remove elements.
-   Reorder elements using accessible controls; drag-and-drop may be
    provided as an enhancement, not the only method.
-   Enforce the configured maximum selected-element count (default:
    ten).
-   Display each element's relevant entry and exit mechanics.
-   Evaluate adjacent transitions.
-   Show next-element suggestions after the final selected element.
-   Recalculate requirement and difficulty summaries after every edit.
-   Support empty, incomplete, and partially verified routines.

The application must distinguish: - selected elements in the user's
draft; - elements eligible for credit; - elements actually counted under
the active rules; - elements or conditions requiring human verification.

Do not assume every selected element contributes to the difficulty
score.

For VT, provide a separate vault selection/planning experience
consistent with the applicable rules. Do not display a ten-element
sequence editor.

### 4.5 Requirement dashboard

Show requirements grouped by category, with status and explanation.

Statuses:

-   `satisfied`
-   `outstanding`
-   `needs-verification`
-   `not-applicable`

Every requirement result should include: - human-readable title; -
explanation; - affected routine elements, if any; - applicable apparatus
and ruleset; - source reference; - status.

Never show a requirement as satisfied solely because an element has a
matching group label if the actual rule has additional conditions.

### 4.6 Transition presentation

Each adjacent pair should display a clear status:

-   **Compatible:** supported by a verified transition rule or
    sufficiently verified mechanics.
-   **Conditional:** possible only when stated conditions are met.
-   **Incompatible:** a known hard constraint rules it out.
-   **Unknown:** the data is insufficient to make a reliable
    determination.

Matching exit and entry states is candidate discovery, not proof of a
valid gymnastics connection. Apparatus mechanics, momentum, grip, swing
phase, direction, and other technical conditions may affect feasibility.

------------------------------------------------------------------------

## 5. Domain model and TypeScript contracts

Implement the domain model in pure TypeScript, independent of React. Use
strict TypeScript settings. Prefer discriminated unions and explicit
types over unvalidated `any` values.

The following interfaces establish the intended shape. They may be
refined during implementation, but changes must preserve the domain
distinctions described here.

### 5.1 Identifiers and common types

``` ts
export type ElementId = string;
export type RuleId = string;
export type RoutineId = string;
export type DatasetVersion = string;

export type Apparatus =
  | "FX" | "PH" | "SR"
  | "VT" | "PB" | "HB";

export type VerificationStatus =
  | "unverified"
  | "machine-extracted"
  | "expert-reviewed"
  | "officially-confirmed";

export interface SourceReference {
  documentId: string;
  documentVersion: string;
  page?: number;
  section?: string;
  tableOrElementNumber?: string;
  sourceText?: string;
  sourceUrl?: string;
}

export interface Provenance {
  status: VerificationStatus;
  sources: SourceReference[];
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}
```

### 5.2 Difficulty and element

``` ts
export type DifficultyLetter =
  | "A" | "B" | "C" | "D" | "E"
  | "F" | "G" | "H" | "I" | "J";

export interface DifficultyValue {
  letter: DifficultyLetter;
  numericValue: number;
  rulesetId: string;
}

export interface ElementRecord {
  id: ElementId;
  apparatus: Apparatus;
  officialIdentifier: string;
  officialName?: string;
  officialDescription: string;
  searchTerms: string[];
  difficulty: DifficultyValue;
  elementGroups: string[];
  movement: MovementProfile;
  phases: MovementPhase[];
  transitionEndpoints: TransitionEndpoint[];
  restrictions: ElementRestriction[];
  illustration?: ElementIllustration;
  provenance: Provenance;
}

export interface ElementIllustration {
  assetPath: string;
  source: SourceReference;
  verificationStatus: VerificationStatus;
  altText: string;
  cropDescription?: string;
}

export interface ElementRestriction {
  id: string;
  description: string;
  ruleId?: RuleId;
  severity: "info" | "warning" | "blocking";
}
```

Do not assume difficulty letter-to-number conversions or element group
meanings are universal. Values must be verified and associated with the
active ruleset.

### 5.3 Physical state and movement

``` ts
export type BodyConfiguration =
  | "straight" | "tucked" | "piked"
  | "straddled" | "mixed" | "other" | "unknown";

export type BodyOrientation =
  | "upright" | "inverted" | "horizontal"
  | "rotating" | "airborne" | "unknown";

export type SupportKind =
  | "hand-support" | "upper-arm-support"
  | "forearm-support" | "foot-support"
  | "mixed-support" | "none" | "unknown";

export type ContactKind =
  | "hands" | "forearms" | "upper-arms"
  | "feet" | "legs" | "body"
  | "no-contact" | "unknown";

export type SwingPhase =
  | "static" | "forward-swing" | "backward-swing"
  | "bottom-of-swing" | "upswing" | "downswing"
  | "release" | "flight" | "catch"
  | "transition" | "unknown";

export type MovementDirection =
  | "forward" | "backward" | "left" | "right"
  | "clockwise" | "counterclockwise"
  | "longitudinal-twist" | "lateral"
  | "multi-axis" | "none" | "unknown";

export type GripType =
  | "overgrip" | "undergrip" | "mixed-grip"
  | "cross-grip" | "L-grip" | "reverse-grip"
  | "one-hand" | "two-hand" | "other"
  | "not-applicable" | "unknown";

export interface GripState {
  type: GripType;
  leftHand?: GripType;
  rightHand?: GripType;
  handContact: "one" | "two" | "none" | "unknown";
  orientation?: string;
}

export interface PhysicalState {
  bodyOrientation: BodyOrientation;
  bodyConfiguration: BodyConfiguration;
  support: SupportKind;
  contacts: ContactKind[];
  swingPhase: SwingPhase;
  grip: GripState;
  apparatusPosition?: string;
  notes?: string;
}

export interface MovementVector {
  direction: MovementDirection;
  rotationDegrees?: number;
  twistDegrees?: number;
  axis?: "longitudinal" | "transverse"
    | "lateral" | "multiple";
}

export interface MovementProfile {
  // Keep direction dimensions distinct where known.
  travelDirection?: MovementDirection;
  rotationDirection?: MovementDirection;
  notes?: string;
}

export interface MovementPhase {
  index: number;
  label: string;
  start: PhysicalState;
  end: PhysicalState;
  movement: MovementVector;
  actions: string[];
  isFlight: boolean;
}

export interface TransitionEndpoint {
  endpointId: string;
  kind: "entry" | "exit" | "intermediate";
  state: PhysicalState;
  movement: MovementVector;
}
```

Treat the vocabulary as extensible and apparatus-aware. Do not force an
irrelevant grip value onto floor or vault elements. `unknown` means the
data is not known; `none` means the attribute is known to be absent.

A movement phase is ordered. A multi-phase element must not be reduced
to only one start/end pair if doing so loses release, flight, catch,
grip, or swing information.

### 5.4 Transition rules

``` ts
export type Compatibility =
  | "compatible"
  | "conditional"
  | "incompatible"
  | "unknown";

export interface TransitionConstraint {
  field: string;
  operator:
    | "equals" | "in" | "not-equals" | "requires";
  value: unknown;
  description: string;
}

export interface TransitionRule {
  id: string;
  apparatus: Apparatus;
  fromElementId?: ElementId;
  toElementId?: ElementId;
  compatibility: Compatibility;
  constraints: TransitionConstraint[];
  explanation: string;
  provenance: Provenance;
}
```

Use endpoint matching to discover candidates, then apply explicit
transition rules and technical constraints. Do not create an exhaustive
element-pair matrix. Unknown is a valid result and must not be converted
into compatible or incompatible by default.

### 5.5 Ruleset and requirements

``` ts
export type RequirementStatus =
  | "satisfied"
  | "outstanding"
  | "needs-verification"
  | "not-applicable";

export type RuleSeverity =
  | "info" | "warning" | "blocking";

export interface ElementFilter {
  apparatus?: Apparatus;
  elementGroups?: string[];
  minimumDifficulty?: DifficultyLetter;
  maximumDifficulty?: DifficultyLetter;
}

export type RulePredicate =
  | {
      type: "count-elements";
      filter: ElementFilter;
      operator: ">=" | "<=" | "=";
      value: number;
    }
  | {
      type: "element-group-coverage";
      groupIds: string[];
      minimumPerGroup: number;
    }
  | {
      type: "difficulty-total";
      minimum?: number;
      maximum?: number;
    }
  | {
      type: "dismount";
      requirement: string;
    }
  | {
      type: "sequence";
      description: string;
      conditionId: string;
    }
  | {
      type: "special-restriction";
      conditionId: string;
    };

export interface RuleDefinition {
  id: RuleId;
  title: string;
  description: string;
  apparatus: Apparatus[];
  rulesetId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  predicate: RulePredicate;
  severity: RuleSeverity;
  source: SourceReference;
  provenance: Provenance;
}

export interface RoutinePolicy {
  maxSelectedElements: number;
  maxCountingElements?: number;
  countingPolicyId: string;
  requirementRuleIds: RuleId[];
}

export interface Ruleset {
  id: string;
  name: string;
  cycle: "2025-2028";
  version: string;
  sourceDocuments: SourceReference[];
  effectiveFrom: string;
  amendments: string[];
  routinePolicies: Partial<Record<Apparatus, RoutinePolicy>>;
}
```

The predicate union is a starting set, not permission to approximate
rules. Add explicit, typed predicates and registered evaluators for
every rule category required by the official code. Do not evaluate
arbitrary code or expressions from data files.

### 5.6 Routine model

``` ts
export interface RoutineElement {
  instanceId: string;
  elementId: ElementId;
  order: number;
  notes?: string;
}

export interface Routine {
  id: RoutineId;
  name: string;
  apparatus: Apparatus;
  rulesetId: string;
  elements: RoutineElement[];
  createdAt: string;
  updatedAt: string;
}

export interface DatasetManifest {
  schemaVersion: string;
  datasetVersion: DatasetVersion;
  rulesetId: string;
  generatedAt: string;
  elementCountByApparatus:
    Partial<Record<Apparatus, number>>;
  sourceDocuments: SourceReference[];
}
```

`instanceId` identifies an occurrence in a routine; `elementId`
identifies the catalogue record. This allows the same catalogue element
to be explored or added more than once while the rules engine
independently evaluates repetition and credit restrictions.

------------------------------------------------------------------------

## 6. Rules engine

Implement a deterministic rules engine as pure functions. It must not
depend on React, browser storage, or UI state.

### 6.1 Evaluation pipeline

1.  Normalize and validate the routine.
2.  Resolve all element IDs and confirm apparatus/ruleset applicability.
3.  Evaluate each adjacent transition.
4.  Apply element eligibility, repetition, and counting policies.
5.  Calculate the applicable difficulty summary.
6.  Evaluate composition and apparatus-specific requirements.
7.  Aggregate issues, warnings, explanations, and source references.

The rules engine must keep these concepts separate:

-   **Selected elements:** everything in the user's draft.
-   **Eligible elements:** elements that may receive credit under the
    rules and known conditions.
-   **Counting elements:** the subset used in the relevant difficulty
    calculation.
-   **Requirement coverage:** elements/conditions that satisfy
    composition rules.
-   **Unresolved elements:** records or performance conditions requiring
    verification.

Do not assume every selected element counts. Do not assume the element
with the highest difficulty always counts without implementing the
complete applicable FIG selection and counting rules.

### 6.2 Evaluation contract

``` ts
export interface TransitionResult {
  fromInstanceId: string;
  toInstanceId: string;
  compatibility: Compatibility;
  explanation: string;
  source?: SourceReference;
}

export interface RuleResult {
  ruleId: RuleId;
  status: RequirementStatus;
  explanation: string;
  affectedElementIds: ElementId[];
  source: SourceReference;
}

export interface EvaluationIssue {
  code: string;
  severity: RuleSeverity;
  message: string;
  affectedInstanceIds: string[];
  source?: SourceReference;
}

export interface RoutineEvaluation {
  routineId: RoutineId;
  rulesetId: string;
  transitions: TransitionResult[];
  counting: CountingResult;
  requirements: RuleResult[];
  difficultySummary: DifficultySummary;
  issues: EvaluationIssue[];
}

export function evaluateRoutine(
  routine: Routine,
  catalogue: ReadonlyMap<ElementId, ElementRecord>,
  ruleset: Ruleset
): RoutineEvaluation;
```

Define `CountingResult` and `DifficultySummary` during implementation
from verified FIG scoring rules. Do not invent their calculation
semantics.

### 6.3 Rule evaluator registry

Generic predicates should handle simple rules. Complex rules should
resolve through statically registered evaluator functions.

``` ts
export interface RuleEvaluationContext {
  routine: Routine;
  elements: ReadonlyMap<ElementId, ElementRecord>;
  ruleset: Ruleset;
}

export type RuleEvaluator = (
  rule: RuleDefinition,
  context: RuleEvaluationContext
) => RuleResult;

export type RuleEvaluatorRegistry =
  ReadonlyMap<string, RuleEvaluator>;
```

Never use `eval`, `Function`, or executable code embedded in
catalogue/rules data.

### 6.4 Requirement semantics

-   `satisfied`: evidence in the routine meets the complete rule.
-   `outstanding`: the routine does not yet meet the rule.
-   `needs-verification`: available data cannot establish the result.
-   `not-applicable`: the rule does not apply to this apparatus or
    context.

Each result must be reproducible and explainable.

------------------------------------------------------------------------

## 7. Recommendation engine

Recommendations must be deterministic and explainable. Do not use an LLM
to invent skills or assert physical compatibility.

### 7.1 Inputs

-   Current routine and selected apparatus.
-   Active ruleset.
-   Last selected element.
-   Last element's ordered movement phases and exit endpoint.
-   Catalogue candidates and their entry endpoints.
-   Verified transition rules.
-   Current requirement evaluation.
-   User preferences, if introduced later.

### 7.2 Candidate discovery and filtering

1.  Restrict to the active apparatus and ruleset.
2.  Find elements whose entry states are plausible matches for the
    current exit state.
3.  Compare relevant support/contact, orientation, grip, swing phase,
    and movement direction dimensions where applicable.
4.  Apply explicit transition rules.
5.  Exclude candidates with known hard incompatibilities.
6.  Apply repetition and other hard constraints relevant to the current
    routine.
7.  Preserve conditional and unknown candidates with clear labels where
    useful.
8.  Stop if the routine has reached its configured selection limit.

State matching is candidate discovery, not proof of a valid connection.
Technical transitions can depend on mechanics not represented in a
simple state pair.

### 7.3 Ranking

Initial product-ranking weights (not FIG scoring values):

  Factor                                       Weight
  ------------------------------------------ --------
  Transition quality                              35%
  Contribution to outstanding requirements        30%
  Difficulty contribution                         20%
  User preference and variety                     15%

Hard constraints are gates and cannot be overridden by a weighted score.

A requirement contribution should be scored only when the rules engine
can establish that adding the candidate would actually improve or
satisfy the requirement.

### 7.4 Recommendation contract

``` ts
export interface Recommendation {
  elementId: ElementId;
  score: number;
  compatibility: Compatibility;
  reasons: string[];
  requiresVerification: boolean;
}

export interface RecommendationContext {
  routine: Routine;
  evaluation: RoutineEvaluation;
  lastElement?: ElementRecord;
}

export function recommendNextElements(
  context: RecommendationContext,
  catalogue: ReadonlyMap<ElementId, ElementRecord>,
  ruleset: Ruleset,
  limit?: number
): Recommendation[];
```

Expected behaviour:

-   Empty routine: recommend useful starting elements; do not fabricate
    a previous endpoint.
-   Non-empty routine: use the final selected element's exit mechanics.
-   Full routine: return no candidates and explain the limit.
-   No verified match: show that no verified transition is available;
    optionally show conditional/unknown candidates separately.
-   Every suggestion: explain compatibility and ranking factors.
-   After adding a suggestion: reevaluate the routine and
    recommendations.

Index catalogue entries by apparatus and normalized entry-state
characteristics so recommendations do not require scanning the entire
catalogue for every UI update.

------------------------------------------------------------------------

## 8. Architecture and technology

### 8.1 Technology choices

-   React
-   TypeScript with strict compiler settings
-   Vite
-   TanStack Router for routing
-   TanStack Query only where asynchronous data loading/caching is
    useful; do not add it merely for local synchronous state
-   IndexedDB for persisted routines
-   A small IndexedDB wrapper such as `idb`, or a similarly maintained
    library
-   Zod for runtime validation of imported JSON, persisted data, and
    dataset boundaries
-   Vitest for domain and unit tests
-   React Testing Library for component tests
-   Playwright for end-to-end tests
-   GitHub Pages for initial static hosting

The app should not require a server API. Bundle or statically serve the
published catalogue and ruleset data.

### 8.2 Suggested source layout

``` text
src/
  app/
    router.tsx
    providers.tsx
  components/
    layout/
    feedback/
    controls/
  features/
    apparatus/
    catalogue/
    element-detail/
    routine-builder/
    recommendations/
    requirements/
    saved-routines/
  domain/
    elements/
      types.ts
      validation.ts
    movement/
      types.ts
      state-matching.ts
    transitions/
      types.ts
      evaluate-transition.ts
    rules/
      types.ts
      registry.ts
      evaluate-rules.ts
    scoring/
      types.ts
      counting.ts
      difficulty.ts
    recommendations/
      types.ts
      candidates.ts
      ranking.ts
    routines/
      types.ts
      validation.ts
      evaluation.ts
  data/
    manifest.json
    elements/
    rules/
    transitions/
  storage/
    database.ts
    routine-repository.ts
  tests/
    fixtures/
    domain/
    integration/
```

Keep feature UI components separate from domain functions. Domain
modules must be testable without rendering React or accessing IndexedDB.

### 8.3 Data loading

At application startup:

1.  Load the dataset manifest.
2.  Confirm schema compatibility.
3.  Load the active ruleset and apparatus data.
4.  Validate records at the data boundary.
5.  Expose read-only catalogue indexes to the application.
6.  Surface a useful error if data is invalid or unavailable.

Avoid loading every large asset eagerly. Load illustrations on demand
and use appropriate image dimensions.

### 8.4 Persistence

Persist routines locally in IndexedDB.

Required operations:

-   Create routine.
-   Read routine.
-   List routines.
-   Update routine.
-   Rename routine.
-   Duplicate routine.
-   Delete routine.
-   Export routine as a versioned JSON file.
-   Import and validate a versioned JSON file.

Routine data must include the ruleset and dataset versions used when it
was created/evaluated. When a later app version changes the dataset, do
not silently rewrite a user's routine or imply that its previous
evaluation remains current. Re-evaluate it against the new ruleset only
with a visible version change.

No personal account data is required for the MVP.

------------------------------------------------------------------------

## 9. Non-functional requirements

### Correctness and integrity

-   Never fabricate official element data, difficulty values, groups, or
    rule requirements.
-   All official facts must have source references.
-   All inferred movement data must be distinguishable from official
    facts.
-   Missing data must produce `unknown` or `needs-verification`, not an
    optimistic assumption.
-   Rule evaluations must be deterministic for a fixed routine and
    dataset.
-   Ruleset changes must be explicit and traceable.
-   Scoring must be implemented from verified source rules and validated
    examples.

### Performance

-   Catalogue search should feel immediate for the expected dataset
    size.
-   Recommendation calculation should not block typing or routine
    editing.
-   Use indexes for element lookup and entry-state candidate discovery.
-   Avoid unnecessary full-catalogue React renders.
-   Load illustrations lazily.
-   Keep the initial application bundle appropriate for static hosting.

### Accessibility

-   Meet WCAG 2.2 AA as the target.
-   All actions must be keyboard accessible.
-   Drag-and-drop must have button/keyboard alternatives.
-   Focus must remain predictable after adding, removing, or reordering
    elements.
-   Do not rely on colour alone for compatibility or requirement status.
-   Use accessible labels and semantic headings.
-   Announce meaningful updates to assistive technology without making
    every recalculation excessively verbose.
-   Support browser zoom and narrow viewports.

### Reliability and privacy

-   Routine data is local to the browser in the MVP.
-   Clearly communicate that clearing browser site data may remove
    locally stored routines unless exported.
-   Validate imported files before saving.
-   Handle corrupted or unsupported persisted data safely.
-   Do not transmit routine data to third parties.
-   Provide an export/backup path.

------------------------------------------------------------------------

## 10. Testing and acceptance criteria

### Domain tests

Test at minimum:

-   Apparatus mismatch.
-   Missing element IDs.
-   Invalid difficulty/ruleset references.
-   Unknown movement state.
-   `none` versus `unknown` semantics.
-   Grip comparison where relevant.
-   Multi-phase movement.
-   Release/flight/catch sequences.
-   Direction and swing-phase matching.
-   Known compatible transitions.
-   Known conditional transitions.
-   Known incompatible transitions.
-   Unknown transitions.
-   Selection limit.
-   Repeated element handling.
-   Counting and difficulty policies.
-   Requirement evaluation and status semantics.
-   Ruleset version changes.
-   Recommendation ranking and explanation generation.

### UI tests

Test:

-   Apparatus navigation.
-   Catalogue search and filters.
-   Element detail display.
-   Add/remove/reorder routine elements.
-   Selection limit feedback.
-   Transition status display.
-   Recommendation reasons.
-   Requirement dashboard updates.
-   Empty and partially populated routines.
-   Save/reopen/delete/duplicate.
-   Import/export validation.
-   Responsive layout and keyboard operation.

### End-to-end acceptance criteria

The MVP is ready for release when:

1.  A user can navigate all six apparatuses.
2.  A user can search and inspect available elements.
3.  A user can build a sequence-based routine with up to ten selected
    elements.
4.  Vault uses its dedicated workflow.
5.  Every sequence transition has an explicit compatibility status.
6.  Recommendations are relevant to the last element and include
    reasons.
7.  Known hard incompatibilities are never recommended as valid
    transitions.
8.  Unknown data is visibly identified.
9.  Requirement statuses update after every routine edit.
10. Selected and counting elements are displayed separately.
11. Difficulty and composition calculations match independently verified
    test fixtures.
12. Routines persist across reloads.
13. Routines can be exported and imported.
14. Ruleset and dataset versions are visible.
15. The app works on a static host without a backend.
16. Core workflows meet the accessibility requirements above.

Do not claim scoring correctness until the relevant FIG rules have been
fully implemented and independently checked against representative
routines and edge cases.

------------------------------------------------------------------------

## 11. Implementation sequence

Build in this order:

### Phase 1 --- Foundation

-   Create the Vite React TypeScript project.
-   Configure strict TypeScript, linting, formatting, and Vitest.
-   Add domain types and runtime schemas.
-   Add a dataset manifest and a small manually curated test fixture.
-   Implement catalogue loading and validation.

**Exit condition:** valid fixture data loads and invalid data produces
actionable errors.

### Phase 2 --- Catalogue

-   Implement apparatus navigation.
-   Implement search and filters.
-   Implement element detail views.
-   Display movement phases, entry/exit states, provenance, and
    available illustrations.

**Exit condition:** a coach can find and inspect an element.

### Phase 3 --- Routine editor

-   Implement routine creation and editing.
-   Add/remove/reorder elements.
-   Enforce the ten-element selection policy.
-   Implement a dedicated vault workflow.
-   Display transition status between adjacent elements.

**Exit condition:** routine editing works with deterministic transition
evaluation.

### Phase 4 --- Recommendations

-   Implement indexed candidate discovery.
-   Implement hard-constraint filtering.
-   Implement weighted ranking.
-   Generate explanation reasons.
-   Handle empty routines, unknown transitions, and full routines.

**Exit condition:** suggestions are explainable and never override hard
constraints.

### Phase 5 --- Rules and scoring

-   Implement the FIG 2025--2028 ruleset data structures.
-   Implement verified counting and difficulty policies.
-   Implement composition requirement evaluators.
-   Add source-linked result explanations.
-   Validate with independent fixtures.

**Exit condition:** supported rules are accurate and unsupported rules
are clearly marked as incomplete.

### Phase 6 --- Persistence and release

-   Add IndexedDB repository.
-   Add import/export.
-   Add version compatibility handling.
-   Complete accessibility and end-to-end testing.
-   Configure GitHub Pages deployment.

**Exit condition:** users can build, save, reopen, and export routines
in the deployed web app.

------------------------------------------------------------------------

## 12. Agent implementation instructions

When implementing this project, follow these rules:

1.  **Do not invent gymnastics facts.** If a catalogue record,
    transition, or FIG rule is unavailable, create a clearly marked
    placeholder or leave it absent.
2.  **Do not fabricate a complete catalogue.** Use a small, clearly
    identified fixture dataset until verified records are supplied.
3.  **Do not mix official facts with derived annotations.** Preserve
    provenance for both.
4.  **Do not put scoring logic in React components.** All evaluation
    belongs in pure domain modules.
5.  **Do not treat state matching as proof of physical compatibility.**
6.  **Do not treat selected elements as counted elements.**
7.  **Do not apply the ten-element planning limit to vault.**
8.  **Do not use an LLM to generate official rules, skill values, or
    confirmed transitions.**
9.  **Do not silently convert unknown values into defaults.**
10. **Do not introduce a backend, authentication, or cloud dependency in
    the MVP.**
11. **Do not implement drag-and-drop as the only way to reorder
    elements.**
12. **Write tests alongside domain functionality.** Do not defer all
    testing until the end.
13. **Keep the app deployable to a static host throughout development.**
14. **Record assumptions and unresolved questions in project
    documentation.**
15. **Prefer small, complete vertical slices over large amounts of
    unverified scaffolding.**

### First task for the coding agent

Start by scaffolding the React + TypeScript + Vite application and
implementing the domain foundation:

-   project configuration;
-   apparatus and ruleset types;
-   element and movement schemas;
-   transition and requirement contracts;
-   runtime validation;
-   a small, explicitly fictional test fixture;
-   unit tests for state matching and unknown transition behaviour.

Do not start by building every screen or populating all FIG elements.
First prove that the data model can represent realistic, multi-phase
gymnastics movements without conflating movement mechanics with scoring
rules.

------------------------------------------------------------------------

## 13. Reference documents

The initial ruleset is FIG Men's Artistic Gymnastics Code of Points
2025--2028.

-   [FIG rules and
    regulations](https://www.gymnastics.sport/site/rules/index.php)
-   [FIG Men's Artistic Gymnastics Code of Points
    2025--2028](https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20MAG%20CoP%202025-2028.pdf)

The application must maintain explicit source-document versions and
account for applicable amendments and supplementary rules. Do not assume
the base Code of Points PDF is the only document relevant to every rule.

**Final product definition:** a local-first, browser-based MAG routine
planning application that combines a source-traceable element catalogue,
detailed movement-state modelling, explainable transition
recommendations, and a versioned FIG requirements engine.
