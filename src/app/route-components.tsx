import { Link, Outlet, useParams } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  APPARATUSES,
  apparatusSchema,
  routineSchema,
  type Apparatus,
  type ElementRecord,
  type Routine,
} from "../domain/schemas";
import { loadCatalogue } from "../data/catalogue";
import { evaluateTransition } from "../domain/transitions/evaluate-transition";
import {
  openLocalDatabase,
  type LocalDatabaseSession,
} from "../storage/sqlite";

const DatabaseContext = createContext<LocalDatabaseSession | undefined>(
  undefined,
);
const CatalogueContext = createContext<readonly ElementRecord[] | undefined>(
  undefined,
);

function useLocalDatabase() {
  return useContext(DatabaseContext);
}

function useCatalogue() {
  return useContext(CatalogueContext) ?? [];
}

type DatabaseStatus = "loading" | "ready" | "error";

export function RootLayout() {
  const [databaseStatus, setDatabaseStatus] =
    useState<DatabaseStatus>("loading");
  const [databaseSession, setDatabaseSession] =
    useState<LocalDatabaseSession>();
  const [catalogue, setCatalogue] = useState<readonly ElementRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    let closeDatabase: (() => void) | undefined;

    void loadCatalogue()
      .then((records) => {
        if (!cancelled) setCatalogue(records);
      })
      .catch((error: unknown) => {
        console.error("Could not load data.sqlite catalogue.", error);
      });

    void openLocalDatabase()
      .then((session) => {
        if (cancelled) {
          session.close();
          return;
        }

        closeDatabase = session.close;
        setDatabaseSession(session);
        setDatabaseStatus("ready");
      })
      .catch((error: unknown) => {
        console.error("Could not open the local SQLite database.", error);
        if (!cancelled) {
          setDatabaseStatus("error");
        }
      });

    return () => {
      cancelled = true;
      closeDatabase?.();
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          Gymnastics Routine Planner
        </Link>
        <p className="storage-status" role="status">
          {databaseStatus === "loading" && "Opening local SQLite database…"}
          {databaseStatus === "ready" && "Local SQLite database ready"}
          {databaseStatus === "error" && "Local database unavailable"}
        </p>
      </header>
      <DatabaseContext.Provider value={databaseSession}>
        <CatalogueContext.Provider value={catalogue}>
          <Outlet />
        </CatalogueContext.Provider>
      </DatabaseContext.Provider>
    </div>
  );
}

export function ApparatusPage() {
  const { apparatus: apparatusParam } = useParams({ strict: false });
  const parsed = apparatusSchema.safeParse(apparatusParam);
  const [search, setSearch] = useState("");

  const apparatus: Apparatus | undefined = parsed.success
    ? parsed.data
    : undefined;
  const catalogue = useCatalogue();
  const records = catalogue.filter(
    (element) => element.apparatus === apparatus,
  );
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      records.filter((element) => {
        if (!normalizedSearch) return true;
        const haystack = [
          element.officialIdentifier,
          element.officialName,
          element.officialDescription,
          element.searchTerms.join(" "),
          element.elementGroups.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      }),
    [normalizedSearch, records],
  );

  if (!parsed.success || !apparatus) {
    return <NotFound />;
  }

  return (
    <main className="content catalogue-layout">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Apparatus</Link>
        <span aria-hidden="true">/</span>
        <span>{apparatus}</span>
      </nav>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ELEMENT CATALOGUE</p>
          <h1>{apparatus}</h1>
        </div>
        {apparatus !== "VT" && (
          <Link
            className="primary-link"
            to="/apparatus/$apparatus/routine"
            params={{ apparatus }}
          >
            Open routine builder
          </Link>
        )}
      </div>

      {apparatus === "VT" ? (
        <section className="empty-state" aria-labelledby="vault-heading">
          <h2 id="vault-heading">Vault planning</h2>
          <p>
            A dedicated vault workflow will be provided here. Vault is not a
            ten-element sequence.
          </p>
        </section>
      ) : (
        <>
          <label className="search-control">
            <span>Search elements</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, identifier, or description"
            />
          </label>

          {filtered.length === 0 ? (
            <section className="empty-state">
              <h2>No catalogue records</h2>
              <p>
                {records.length === 0
                  ? "OCR candidates have not been extracted for this apparatus."
                  : "No records match this search."}
              </p>
            </section>
          ) : (
            <ul className="element-list" aria-label={`${apparatus} elements`}>
              {filtered.map((element) => (
                <li key={element.id}>
                  <ElementCard apparatus={apparatus} element={element} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <p className="fixture-note">
        OCR candidates from data.sqlite · Expert review required.
      </p>
    </main>
  );
}

function ElementCard({
  apparatus,
  element,
}: {
  apparatus: Apparatus;
  element: ElementRecord;
}) {
  return (
    <Link
      className="element-card"
      to="/apparatus/$apparatus/elements/$elementId"
      params={{ apparatus, elementId: element.id }}
    >
      <span className="element-card-id">{element.officialIdentifier}</span>
      <span className="element-card-name">
        {element.officialName ?? "Unnamed OCR candidate"}
      </span>
      <span className="element-card-difficulty">
        {element.difficulty.letter} · Unverified
      </span>
      <span className="element-card-arrow" aria-hidden="true">
        View
      </span>
    </Link>
  );
}

export function ElementDetailPage() {
  const params = useParams({ strict: false });
  const apparatusResult = apparatusSchema.safeParse(params.apparatus);
  const catalogue = useCatalogue();
  const element = catalogue.find((record) => record.id === params.elementId);

  if (
    !apparatusResult.success ||
    !element ||
    element.apparatus !== apparatusResult.data
  ) {
    return <NotFound />;
  }

  const entryEndpoints = element.transitionEndpoints.filter(
    (endpoint) => endpoint.kind === "entry",
  );
  const exitEndpoints = element.transitionEndpoints.filter(
    (endpoint) => endpoint.kind === "exit",
  );

  return (
    <main className="content element-detail">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Apparatus</Link>
        <span aria-hidden="true">/</span>
        <Link
          to="/apparatus/$apparatus"
          params={{ apparatus: element.apparatus }}
        >
          {element.apparatus}
        </Link>
        <span aria-hidden="true">/</span>
        <span>{element.officialIdentifier}</span>
      </nav>

      <header className="detail-heading">
        <div>
          <p className="eyebrow">{element.officialIdentifier}</p>
          <h1>{element.officialName ?? "Unnamed OCR candidate"}</h1>
        </div>
        <span className="difficulty-badge">
          Difficulty {element.difficulty.letter}
        </span>
      </header>

      <div className="detail-grid">
        <section>
          <h2>Description</h2>
          <p>{element.officialDescription}</p>
          <dl className="facts">
            <div>
              <dt>Apparatus</dt>
              <dd>{element.apparatus}</dd>
            </div>
            <div>
              <dt>Verification</dt>
              <dd>{element.provenance.status}</dd>
            </div>
            <div>
              <dt>Groups</dt>
              <dd>
                {element.elementGroups.length
                  ? element.elementGroups.join(", ")
                  : "None recorded"}
              </dd>
            </div>
            <div>
              <dt>Ruleset</dt>
              <dd>{element.difficulty.rulesetId}</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2>Movement phases</h2>
          {element.phases.length ? (
            <ol className="phase-list">
              {element.phases.map((phase) => (
                <li key={phase.index}>
                  <strong>{phase.label}</strong>
                  <span>
                    {phase.start.swingPhase} to {phase.end.swingPhase}
                  </span>
                  <span>
                    {phase.movement.direction}
                    {phase.movement.rotationDegrees
                      ? ` · ${phase.movement.rotationDegrees}°`
                      : ""}
                  </span>
                  {phase.isFlight && <span>Flight phase</span>}
                </li>
              ))}
            </ol>
          ) : (
            <p>Movement phases are not recorded.</p>
          )}
        </section>

        <section>
          <h2>Transition endpoints</h2>
          <p>
            <strong>Entry:</strong>{" "}
            {entryEndpoints.length
              ? entryEndpoints
                  .map((endpoint) => endpoint.state.swingPhase)
                  .join(", ")
              : "Not recorded"}
          </p>
          <p>
            <strong>Exit:</strong>{" "}
            {exitEndpoints.length
              ? exitEndpoints
                  .map((endpoint) => endpoint.state.swingPhase)
                  .join(", ")
              : "Not recorded"}
          </p>
        </section>

        <section>
          <h2>Provenance</h2>
          <p>{element.provenance.notes ?? "No provenance notes."}</p>
          {element.provenance.sources.length === 0 && (
            <p>No source references are available.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export function RoutineBuilderPage() {
  const params = useParams({ strict: false });
  const apparatusResult = apparatusSchema.safeParse(params.apparatus);
  const database = useLocalDatabase();
  const catalogue = useCatalogue();
  const [saveStatus, setSaveStatus] = useState("");
  const [savedId, setSavedId] = useState<string>();
  const [routine, setRoutine] = useState<Routine>(() => {
    const now = new Date().toISOString();
    return routineSchema.parse({
      id: crypto.randomUUID(),
      name: "Untitled routine",
      apparatus: "HB",
      rulesetId: "ocr-candidate-dataset",
      datasetVersion: "ocr-candidate-dataset",
      elements: [],
      createdAt: now,
      updatedAt: now,
    });
  });

  if (!apparatusResult.success) return <NotFound />;
  if (apparatusResult.data === "VT") {
    return (
      <main className="content">
        <h1>Vault routine planning</h1>
        <p>
          Vault uses a dedicated planning workflow and is not represented as a
          ten-element sequence.
        </p>
        <Link
          className="text-link"
          to="/apparatus/$apparatus"
          params={{ apparatus: "VT" }}
        >
          Return to vault catalogue
        </Link>
      </main>
    );
  }

  const apparatus = apparatusResult.data;
  const records = catalogue.filter(
    (element) => element.apparatus === apparatus,
  );
  const resolvedElements = routine.elements.map((instance) =>
    catalogue.find((element) => element.id === instance.elementId),
  );

  const updateRoutine = (next: Routine) => {
    setRoutine(
      routineSchema.parse({ ...next, updatedAt: new Date().toISOString() }),
    );
  };

  const addElement = (element: ElementRecord) => {
    if (routine.elements.length >= 10) {
      setSaveStatus("The ten-element planning limit has been reached.");
      return;
    }
    updateRoutine({
      ...routine,
      apparatus,
      elements: [
        ...routine.elements,
        {
          instanceId: crypto.randomUUID(),
          elementId: element.id,
          order: routine.elements.length,
        },
      ],
    });
  };

  const removeElement = (instanceId: string) => {
    updateRoutine({
      ...routine,
      elements: routine.elements
        .filter((element) => element.instanceId !== instanceId)
        .map((element, index) => ({ ...element, order: index })),
    });
  };

  const moveElement = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= routine.elements.length) return;
    const elements = [...routine.elements];
    [elements[index], elements[nextIndex]] = [
      elements[nextIndex],
      elements[index],
    ];
    updateRoutine({
      ...routine,
      elements: elements.map((element, order) => ({ ...element, order })),
    });
  };

  const saveRoutine = async () => {
    if (!database) {
      setSaveStatus("The local database is not ready.");
      return;
    }
    try {
      const validated = routineSchema.parse({ ...routine, apparatus });
      const saved = savedId
        ? await database.repository.updateRoutine(validated)
        : await database.repository.createRoutine(validated);
      setSavedId(saved.id);
      setSaveStatus("Routine saved locally.");
    } catch (error) {
      setSaveStatus(
        error instanceof Error ? error.message : "Could not save the routine.",
      );
    }
  };

  return (
    <main className="content builder-layout">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Apparatus</Link>
        <span aria-hidden="true">/</span>
        <Link to="/apparatus/$apparatus" params={{ apparatus }}>
          {apparatus}
        </Link>
        <span aria-hidden="true">/</span>
        <span>Routine builder</span>
      </nav>

      <header className="builder-heading">
        <div>
          <p className="eyebrow">ROUTINE BUILDER</p>
          <label className="routine-name-label">
            Routine name
            <input
              value={routine.name}
              onChange={(event) =>
                updateRoutine({ ...routine, name: event.target.value })
              }
            />
          </label>
        </div>
        <button
          className="save-button"
          type="button"
          onClick={() => void saveRoutine()}
        >
          Save routine
        </button>
      </header>

      <p className="builder-status" role="status">
        {saveStatus || `${routine.elements.length} of 10 selected`}
      </p>

      <div className="builder-grid">
        <section aria-labelledby="sequence-heading">
          <h2 id="sequence-heading">Sequence</h2>
          {routine.elements.length === 0 ? (
            <div className="empty-state">
              <p>Add OCR candidate elements from the catalogue to begin.</p>
            </div>
          ) : (
            <ol className="routine-sequence">
              {routine.elements.map((instance, index) => {
                const element = resolvedElements[index];
                if (!element) return null;
                const next = resolvedElements[index + 1];
                const transition = next
                  ? evaluateTransition(apparatus, element.id, next.id, [])
                  : undefined;
                return (
                  <li key={instance.instanceId}>
                    <div className="sequence-item">
                      <span className="sequence-number">{index + 1}</span>
                      <div>
                        <strong>{element.officialName}</strong>
                        <span>
                          {element.officialIdentifier} ·{" "}
                          {element.difficulty.letter}
                        </span>
                      </div>
                      <div className="sequence-actions">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveElement(index, -1)}
                          aria-label={`Move ${element.officialName} up`}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={index === routine.elements.length - 1}
                          onClick={() => moveElement(index, 1)}
                          aria-label={`Move ${element.officialName} down`}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeElement(instance.instanceId)}
                          aria-label={`Remove ${element.officialName}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    {transition && (
                      <p
                        className={`transition transition-${transition.compatibility}`}
                      >
                        <strong>{transition.compatibility}</strong>:{" "}
                        {transition.explanation}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section aria-labelledby="available-heading">
          <h2 id="available-heading">Available OCR candidates</h2>
          {records.length === 0 ? (
            <p>No OCR candidates are available for this apparatus.</p>
          ) : (
            <ul className="available-elements">
              {records.map((element) => (
                <li key={element.id}>
                  <div>
                    <strong>{element.officialName}</strong>
                    <span>{element.officialIdentifier}</span>
                  </div>
                  <button
                    type="button"
                    disabled={routine.elements.length >= 10}
                    onClick={() => addElement(element)}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="content">
      <h1>Not found</h1>
      <p>This apparatus or catalogue element is not available.</p>
      <Link className="text-link" to="/">
        Return to apparatuses
      </Link>
    </main>
  );
}

export function HomePage() {
  const catalogue = useCatalogue();

  return (
    <main className="content">
      <p className="eyebrow">MEN'S ARTISTIC GYMNASTICS</p>
      <h1>Plan a routine with confidence.</h1>
      <p className="intro">
        Explore apparatus-specific movement data and build a routine with
        explainable transitions. Official catalogue and scoring data are not
        included yet.
      </p>
      <section aria-labelledby="apparatus-heading">
        <h2 id="apparatus-heading">Choose an apparatus</h2>
        <ul className="apparatus-grid">
          {APPARATUSES.map((apparatus) => (
            <li key={apparatus}>
              <Link
                className="apparatus-card"
                to="/apparatus/$apparatus"
                params={{ apparatus }}
              >
                <span>{apparatus}</span>
                <span>
                  {(() => {
                    const count = catalogue.filter(
                      (element) => element.apparatus === apparatus,
                    ).length;
                    return count > 0
                      ? `${count} OCR candidates`
                      : "No extracted candidates";
                  })()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <p className="fixture-note">
        OCR catalogue candidates · Not official FIG element records.
      </p>
    </main>
  );
}
