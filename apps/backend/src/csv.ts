import { parse } from "csv-parse/sync";
import { Dataset } from "./types.js";

export function loadCsv(name: string, content: string): Dataset {
  const rows = parse(content, { columns: true, skip_empty_lines: true });
  const columns = Object.keys(rows[0] ?? {});
  const data = rows.map((r: any) => columns.map((c) => r[c] ?? null));
  return { name, columns, rows: data };
}
