import initSqlJs, { type Database } from "sql.js";
import sqliteWasmUrl from "sql.js/dist/sql-wasm.wasm?url";
import dataSqliteUrl from "./data.sqlite?url";
import {
  elementRecordSchema,
  type Apparatus,
  type ElementRecord,
} from "../domain/schemas";

const TABLES: ReadonlyArray<{ table: string; apparatus: Apparatus }> = [
  { table: "floor", apparatus: "FX" },
  { table: "pommel_horse", apparatus: "PH" },
  { table: "rings", apparatus: "SR" },
  { table: "vault", apparatus: "VT" },
  { table: "parallel_bars", apparatus: "PB" },
  { table: "horizontal_bar", apparatus: "HB" },
];

let cataloguePromise: Promise<ReadonlyArray<ElementRecord>> | undefined;

export function loadCatalogue(): Promise<ReadonlyArray<ElementRecord>> {
  if (!cataloguePromise) {
    cataloguePromise = loadCatalogueFromSqlite();
  }
  return cataloguePromise;
}

async function loadCatalogueFromSqlite(): Promise<
  ReadonlyArray<ElementRecord>
> {
  const response = await fetch(dataSqliteUrl);
  if (!response.ok) {
    throw new Error(`Could not load data.sqlite (${response.status}).`);
  }

  const SQL = await initSqlJs({ locateFile: () => sqliteWasmUrl });
  const database: Database = new SQL.Database(
    new Uint8Array(await response.arrayBuffer()),
  );

  try {
    const records: ElementRecord[] = [];

    for (const mapping of TABLES) {
      const result = database.exec(
        `SELECT id, box, difficulty, "group", name, nickname, source_page,
                raw_ocr_text, candidate_status
         FROM "${mapping.table}" ORDER BY id`,
      );
      if (!result[0]) continue;

      const columns = result[0].columns;
      for (const values of result[0].values) {
        const row = Object.fromEntries(
          columns.map((column, index) => [column, values[index]]),
        );
        const id = `${mapping.table}-${String(row.id)}`;
        const page =
          typeof row.source_page === "number" && row.source_page > 0
            ? row.source_page
            : undefined;
        const description = String(
          row.raw_ocr_text ?? row.name ?? "OCR text unavailable.",
        );
        const officialName = row.nickname
          ? String(row.nickname)
          : typeof row.name === "string" && row.name.trim()
            ? row.name.trim()
            : undefined;
        const status =
          row.candidate_status === "review_required"
            ? ("machine-extracted" as const)
            : ("machine-extracted" as const);

        records.push(
          elementRecordSchema.parse({
            id,
            apparatus: mapping.apparatus,
            officialIdentifier: `${mapping.table.toUpperCase().replace("_", "-")}-${String(row.id).padStart(3, "0")}`,
            officialName,
            officialDescription: description,
            searchTerms: [
              String(row.box ?? ""),
              String(row.group ?? ""),
            ].filter(Boolean),
            difficulty: {
              letter: "unknown",
              numericValue: null,
              rulesetId: "ocr-candidate-dataset",
            },
            elementGroups:
              typeof row.group === "string" && row.group.trim()
                ? [row.group.trim()]
                : [],
            movement: {
              notes: "Movement metadata is not extracted by this dataset.",
            },
            phases: [],
            transitionEndpoints: [],
            restrictions: [],
            provenance: {
              status,
              sources: [
                {
                  documentId: "data.sqlite",
                  documentVersion: "ocr-candidate-dataset",
                  page,
                  tableOrElementNumber: String(row.id),
                  sourceText: description,
                },
              ],
              notes:
                "OCR candidate from data.sqlite; requires expert review. Not verified FIG catalogue data.",
            },
          }),
        );
      }
    }

    return records;
  } finally {
    database.close();
  }
}
