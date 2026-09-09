# Device Catalog — Product Requirements & TODO

A personal inventory for owned devices and gadgets. Add, edit, and remove
devices through dialogs; browse them in grid/list views and inspect a full
detail view; persist everything to a local YAML file (same shape as
`device-list.yaml`).

## Vision

Own your collection — computers, cameras, lenses, and whatever else — in a
single file you can read, version, and share, with a UI that makes the
catalog pleasant to browse and trivial to maintain.

## Goals (v1 features)

- [ ] Add a device via a modal dialog
- [ ] Edit a device via the same dialog, pre-filled
- [ ] Remove a device with a confirmation step
- [ ] Persist all devices to a local YAML file matching the existing schema
- [ ] Display all devices in a grid view
- [ ] Display all devices in a list/table view (toggle between grid and list)
- [ ] Device detail view rendering every field present in the YAML
- [ ] Search, filter by device type, and filter by keyword tags
- [ ] Group by device type
- [ ] Run as a native desktop app

## Non-goals (v1)

- Multi-user accounts or cloud sync
- Photo/attachment upload per device
- Import from other formats or scraping
- Undo / version history (the YAML file itself is the history)
- Editing the device-type/schema definitions from within the app

## Data model

`device-list.yaml` is a flat list of devices. Each device declares a
`device-type` (`computer`, `camera`); extensible (lenses, phones, audio, …).

Each device:

- `identifier` — string, unique slug, primary key
- `device-type` — string, the device kind (`computer`, `camera`); extensible
- `name` — manufacturer product name ("Nikon D100", "Power Mac G5"); absent
  for custom builds
- `nickname` — personal label ("Fairy", "P2"); absent when the product name is
  the label
- `chassis` — string, computers only (tower/laptop/rack-4u/pizzabox)
- `keywords` — string list
- `os` — string list (empty `[]` when unknown)
- `purpose` — string list, computers only
- `specs` — free-form map of typed values:
  - scalar string (`cpu: amd-ryzen-r9-5950x`, `mount: EF`)
  - scalar number (`ram-count: 4`)
  - `Quantity` `{ value, unit, type? }` for measured values
    (`ram: { value: 32, unit: gb, type: ddr4-uecc }`, `pixel: { value: 60, unit: mp }`)
  - lists — storage capacities (`hdd: [{ value: 16, unit: tb }, …]`) and lens
    ranges (`focal-length: [6.33, 19]` zoom / `[16.6]` prime, `f-stop: [3.5, 4.3]`)
  - nested map (`sensor-size: { width, height, unit }`, `lens: {…}`)
- `serial`, `acquired` (YYYY-MM-DD), `condition` (float 0..1), `notes`,
  `photos` (local filesystem paths; desktop-only rendering), `related` —
  optional metadata, none populated in the seed file yet

```ts
type Quantity = { value: number; unit: string; type?: string };

type SpecValue =
  | string
  | number
  | Quantity
  | SpecValue[]
  | { [k: string]: SpecValue };

interface Device {
  identifier: string;
  deviceType: string;  // "computer", "camera", …
  name?: string;        // product name
  nickname?: string;    // personal label
  keywords: string[];
  chassis?: string;
  os: string[];
  purpose: string[];
  specs: Record<string, SpecValue>;
  serial?: string;
  acquired?: string;
  condition?: number;   // 0 (broken) to 1 (brand new)
  notes?: string;
  photos?: string[];
  related?: string[];
}

type Catalog = Device[];
```

## Tech decision: Tauri

**Verdict: yes.** Tauri v2 builds native desktop apps (Windows/macOS/Linux)
from a web-technology frontend plus a **Rust** core. For this app the backend
is trivial — read/write one YAML file — so the Rust surface stays tiny (the fs
plugin handles file I/O). Tauri's small binary and low memory beat Electron,
with no Node in the app.

The app reads/writes `device-list.yaml` in Tauri's app-data directory via
`@tauri-apps/plugin-fs` — a classic local desktop app. No web target.

## Architecture sketch

packages/core          # TS: types, YAML serde (js-yaml), CRUD, validation, normalization
packages/ui            # Vue 3 UI: grid, list, detail, dialogs
apps/desktop           # Tauri shell -> core, fs plugin storage adapter (in-place YAML edit)

## Decisions

- Web: abandoned — native desktop only (local filesystem paths for photos).
- Schema: flexible typed specs (fixed core fields + arbitrary typed specs map).
- Native targets: desktop only (macOS first; Windows/Linux follow-up).
- Existing data: import `device-list.yaml` and normalize its inconsistencies as
  the seed catalog.
- Frontend: Vue 3 + TypeScript.

## TODO

### 1. Foundation
- [ ] Scaffold Vue 3 + TypeScript + Vite workspace (core + ui + apps)
- [ ] Scaffold Tauri v2 desktop app
- [ ] Create shared `core` package: types, YAML serde, CRUD, validation

### 2. Data layer
- [ ] Implement YAML parse/serialize (`js-yaml`) with stable key ordering
- [ ] Implement legacy normalization (keyword→keywords, os/purpose lift, scalar/list coercion)
- [ ] Define `StorageAdapter` interface + Tauri fs implementation
- [ ] Handle malformed YAML / write failures with clear errors

### 3. Core state & browse UI
- [ ] App state store: load catalog, add/edit/remove actions
- [ ] Grid view (cards: name, device-type, keyword chips)
- [ ] List/table view + grid/list toggle
- [ ] Device-type grouping
- [ ] Search, device-type filter, keyword tag filter
- [ ] Device detail view (renders every field, nested specs, lists)

### 4. Dialogs (add/edit/remove)
- [ ] Add/edit modal: identifier, name, device-type, keywords, specs, os, purpose
- [ ] Specs editor supporting string / number / list / nested map values
- [ ] Keyword tag editor (add/remove chips)
- [ ] Remove confirmation dialog
- [ ] Validation: unique identifier, required name, identifier format

### 5. Persistence & integration
- [ ] Auto-save or explicit save writing back to YAML
- [ ] Load catalog on startup
- [ ] Round-trip test: load `device-list.yaml`, re-serialize, re-load

### 6. Native packaging
- [ ] Tauri desktop build (macOS; Win/Linux follow-up)

### 7. Polish & verification
- [ ] Empty / loading / error states
- [ ] Smoke test full CRUD round-trip against `device-list.yaml`
- [ ] Keyboard/accessibility pass on dialogs
