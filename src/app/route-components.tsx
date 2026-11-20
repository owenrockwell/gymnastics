import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { APPARATUSES } from "../domain/schemas";
import { openLocalDatabase } from "../storage/sqlite";

type DatabaseStatus = "loading" | "ready" | "error";

export function RootLayout() {
  const [databaseStatus, setDatabaseStatus] =
    useState<DatabaseStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    let closeDatabase: (() => void) | undefined;

    void openLocalDatabase()
      .then((session) => {
        if (cancelled) {
          session.close();
          return;
        }

        closeDatabase = session.close;
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
      <Outlet />
    </div>
  );
}

export function HomePage() {
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
              <button className="apparatus-card" type="button" disabled>
                <span>{apparatus}</span>
                <span>Catalogue coming soon</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <p className="fixture-note">
        Foundation build · Fixture records are fictional and for tests only.
      </p>
    </main>
  );
}
