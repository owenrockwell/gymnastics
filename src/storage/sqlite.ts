import { openDB, type DBSchema } from "idb";
import initSqlJs, { type Database } from "sql.js";
import sqliteWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import { routineSchema, type Routine } from "../domain/schemas";

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
  CREATE INDEX IF NOT EXISTS routines_updated_at_idx ON routines(updated_at);
  CREATE INDEX IF NOT EXISTS routines_apparatus_idx ON routines(apparatus);
`;

export interface RoutineExport {
  format: "gymnastics-routine-planner";
  formatVersion: 1;
  exportedAt: string;
  routine: Routine;
}

interface RoutineRow {
  id: string;
  name: string;
  apparatus: string;
  ruleset_id: string;
  dataset_version: string;
  elements_json: string;
  created_at: string;
  updated_at: string;
}

function parseRoutineRow(row: RoutineRow): Routine {
  let elements: unknown;
  try {
    elements = JSON.parse(row.elements_json);
  } catch {
    throw new Error(`Routine "${row.id}" contains corrupted element data.`);
  }

  return routineSchema.parse({
    id: row.id,
    name: row.name,
    apparatus: row.apparatus,
    rulesetId: row.ruleset_id,
    datasetVersion: row.dataset_version,
    elements,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export class RoutineRepository {
  constructor(
    private readonly database: Database,
    private readonly persist: () => Promise<void>,
  ) {}

  async createRoutine(routine: Routine): Promise<Routine> {
    const validated = routineSchema.parse(routine);
    this.database.run("BEGIN");
    try {
      this.database.run(
        `INSERT INTO routines
          (id, name, apparatus, ruleset_id, dataset_version, elements_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validated.id,
          validated.name,
          validated.apparatus,
          validated.rulesetId,
          validated.datasetVersion,
          JSON.stringify(validated.elements),
          validated.createdAt,
          validated.updatedAt,
        ],
      );
      this.database.run("COMMIT");
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
    await this.persist();
    return validated;
  }

  async updateRoutine(routine: Routine): Promise<Routine> {
    const validated = routineSchema.parse(routine);
    const existing = await this.getRoutine(validated.id);
    if (!existing) {
      throw new Error(`Routine "${validated.id}" does not exist.`);
    }

    this.database.run("BEGIN");
    try {
      this.database.run(
        `UPDATE routines SET
           name = ?, apparatus = ?, ruleset_id = ?, dataset_version = ?,
           elements_json = ?, updated_at = ?
         WHERE id = ?`,
        [
          validated.name,
          validated.apparatus,
          validated.rulesetId,
          validated.datasetVersion,
          JSON.stringify(validated.elements),
          validated.updatedAt,
          validated.id,
        ],
      );
      this.database.run("COMMIT");
    } catch (error) {
      this.database.run("ROLLBACK");
      throw error;
    }
    await this.persist();
    return validated;
  }

  async getRoutine(id: string): Promise<Routine | undefined> {
    const result = this.database.exec(
      `SELECT id, name, apparatus, ruleset_id, dataset_version,
              elements_json, created_at, updated_at
       FROM routines WHERE id = ? LIMIT 1`,
      [id],
    );
    return result[0]?.values[0]
      ? parseRoutineRow(this.rowToObject(result[0]))
      : undefined;
  }

  async listRoutines(apparatus?: Routine["apparatus"]): Promise<Routine[]> {
    const result = apparatus
      ? this.database.exec(
          `SELECT id, name, apparatus, ruleset_id, dataset_version,
                  elements_json, created_at, updated_at
           FROM routines WHERE apparatus = ? ORDER BY updated_at DESC, name ASC`,
          [apparatus],
        )
      : this.database.exec(
          `SELECT id, name, apparatus, ruleset_id, dataset_version,
                  elements_json, created_at, updated_at
           FROM routines ORDER BY updated_at DESC, name ASC`,
        );

    return (result[0]?.values ?? []).map((values) =>
      parseRoutineRow(this.valuesToObject(result[0].columns, values)),
    );
  }

  async renameRoutine(id: string, name: string): Promise<Routine | undefined> {
    const existing = await this.getRoutine(id);
    if (!existing) return undefined;

    return this.updateRoutine({
      ...existing,
      name,
      updatedAt: new Date().toISOString(),
    });
  }

  async duplicateRoutine(id: string): Promise<Routine | undefined> {
    const existing = await this.getRoutine(id);
    if (!existing) return undefined;

    const now = new Date().toISOString();
    const duplicate: Routine = {
      ...existing,
      id: crypto.randomUUID(),
      name: `${existing.name} (copy)`,
      elements: existing.elements.map((element) => ({
        ...element,
        instanceId: crypto.randomUUID(),
      })),
      createdAt: now,
      updatedAt: now,
    };
    return this.createRoutine(duplicate);
  }

  async deleteRoutine(id: string): Promise<boolean> {
    const existing = await this.getRoutine(id);
    if (!existing) return false;

    this.database.run("DELETE FROM routines WHERE id = ?", [id]);
    await this.persist();
    return true;
  }

  exportRoutine(routine: Routine): RoutineExport {
    return {
      format: "gymnastics-routine-planner",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      routine: routineSchema.parse(routine),
    };
  }

  async importRoutine(payload: string | unknown): Promise<Routine> {
    let parsed: unknown = payload;
    if (typeof payload === "string") {
      parsed = JSON.parse(payload);
    }

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Invalid routine export: expected a JSON object.");
    }
    const envelope = parsed as Partial<RoutineExport>;
    if (envelope.format !== "gymnastics-routine-planner") {
      throw new Error("Unsupported routine export format.");
    }
    if (envelope.formatVersion !== 1) {
      throw new Error(
        `Unsupported routine export version: ${String(envelope.formatVersion)}.`,
      );
    }

    return this.createRoutine(routineSchema.parse(envelope.routine));
  }

  private rowToObject(result: {
    columns: string[];
    values: unknown[][];
  }): RoutineRow {
    return this.valuesToObject(
      result.columns,
      result.values[0],
    ) as unknown as RoutineRow;
  }

  private valuesToObject(columns: string[], values: unknown[]): RoutineRow {
    const row = Object.fromEntries(
      columns.map((column, index) => [column, values[index]]),
    );
    return row as unknown as RoutineRow;
  }
}

export interface LocalDatabaseSession {
  database: Database;
  persist: () => Promise<void>;
  repository: RoutineRepository;
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
    let database: Database;
    if (savedBytes) {
      try {
        database = new SQL.Database(savedBytes);
      } catch {
        database = new SQL.Database();
      }
    } else {
      database = new SQL.Database();
    }
    database.run(CREATE_ROUTINES_TABLE);

    const persist = async () => {
      const databaseBytes = database.export();
      await persistence.put("sqlite", databaseBytes, DATABASE_KEY);
    };

    await persist();

    return {
      database,
      persist,
      repository: new RoutineRepository(database, persist),
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
