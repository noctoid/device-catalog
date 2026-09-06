import { appDataDir, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import seedYaml from "../../../device-list.yaml?raw";

/** Name of the catalog file inside the Tauri app-data directory. */
const DATA_FILE = "device-list.yaml";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Load the catalog YAML text.
 *
 * - Under Tauri: read the app-data file, seeding it from the bundled copy on
 *   first run.
 * - In plain-browser dev: return the bundled copy (Tauri APIs are unavailable).
 */
export async function loadCatalogYaml(): Promise<string> {
  if (!isTauri()) return seedYaml;

  const filePath = await join(await appDataDir(), DATA_FILE);
  if (await exists(filePath)) {
    return await readTextFile(filePath);
  }
  await writeTextFile(filePath, seedYaml);
  return seedYaml;
}

/** Persist the catalog YAML text to the app-data file. No-op outside Tauri. */
export async function saveCatalogYaml(yaml: string): Promise<void> {
  if (!isTauri()) return;

  const filePath = await join(await appDataDir(), DATA_FILE);
  await writeTextFile(filePath, yaml);
}

/**
 * Open a native file dialog to pick a YAML file; returns its text, or null if
 * cancelled. No-op outside Tauri.
 */
export async function openCatalogFile(): Promise<string | null> {
  if (!isTauri()) return null;

  const selected = await open({
    multiple: false,
    filters: [{ name: "YAML", extensions: ["yaml", "yml"] }],
  });
  if (typeof selected !== "string") return null;
  return await readTextFile(selected);
}
