import { openDB, type DBSchema } from "idb";
import initSqlJs, { type Database } from "sql.js";
import sqliteWasmUrl from "sql.js/dist/sql-wasm.wasm?url";

interface LocalPersistence extends DBSchema {
  sqlite: {
    key: string;
    value: Uint8Array;
  };
}

const DATABASE_NAME = "gymnastics-routine-planner";
const DATABASE_KEY = "main";

const CREATE_ROUTINES_TABLE = `
  CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    apparatus TEXT NOT NULL CHECK (apparatus IN ('FX', 'PH', 'SR', 'VT', 'PB', 'HB')),
    ruleset_id TEXT NOT NULL,
    dataset_version TEXT NOT NULL,
    elements_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`;

export interface LocalDatabaseSession {
  database: Database;
  persist: () => Promise<void>;
  close: () => void;
}

export async function openLocalDatabase(): Promise<LocalDatabaseSession> {
  const SQL = await initSqlJs({ locateFile: () => sqliteWasmUrl });
  const persistence = await openDB<LocalPersistence>(DATABASE_NAME, 1, {
    upgrade(database) {
      database.createObjectStore("sqlite");
    },
  });

  try {
    const savedBytes = await persistence.get("sqlite", DATABASE_KEY);
    const database = savedBytes
      ? new SQL.Database(savedBytes)
      : new SQL.Database();
    database.run(CREATE_ROUTINES_TABLE);

    const persist = async () => {
      const databaseBytes = database.export();
      await persistence.put("sqlite", databaseBytes, DATABASE_KEY);
    };

    await persist();

    return {
      database,
      persist,
      close: () => {
        database.close();
        persistence.close();
      },
    };
  } catch (error) {
    persistence.close();
    throw error;
  }
}
