import type { Catalog, Device, SpecValue } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringList(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

function toOptionalString(value: unknown): string | undefined {
  if (value == null) return undefined;
  return String(value);
}

function coerceSpecValue(value: unknown): SpecValue {
  if (Array.isArray(value)) {
    return value.map((item) =>
      isRecord(item) ? coerceSpecMap(item) : (item as string | number),
    );
  }
  if (isRecord(value)) return coerceSpecMap(value);
  return value as string | number;
}

function coerceSpecMap(record: Record<string, unknown>): Record<string, SpecValue> {
  const out: Record<string, SpecValue> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = coerceSpecValue(value);
  }
  return out;
}

/**
 * Normalize a raw YAML device record into the canonical `Device` shape.
 *
 * The seed file is already normalized; this still tolerates the legacy
 * quirks (`keyword` singular, `os`/`purpose` nested under `specs`) so old
 * files don't break.
 */
export function normalizeDevice(raw: unknown, category: string): Device {
  if (!isRecord(raw)) {
    throw new Error(`device in category "${category}" must be a mapping`);
  }

  const keywords = toStringList(raw.keywords ?? raw.keyword);

  const rawSpecs = isRecord(raw.specs) ? raw.specs : {};
  const specs: Record<string, SpecValue> = {};
  for (const [key, value] of Object.entries(rawSpecs)) {
    if (key === "os" || key === "purpose") continue;
    specs[key] = coerceSpecValue(value);
  }

  const device: Device = {
    identifier: String(raw.identifier ?? ""),
    category,
    keywords,
    os: toStringList(raw.os ?? rawSpecs.os),
    purpose: toStringList(raw.purpose ?? rawSpecs.purpose),
    specs,
  };

  const name = toOptionalString(raw.name);
  if (name !== undefined) device.name = name;
  const nickname = toOptionalString(raw.nickname);
  if (nickname !== undefined) device.nickname = nickname;
  const chassis = toOptionalString(raw.chassis);
  if (chassis !== undefined) device.chassis = chassis;
  const serial = toOptionalString(raw.serial);
  if (serial !== undefined) device.serial = serial;
  const acquired = toOptionalString(raw.acquired);
  if (acquired !== undefined) device.acquired = acquired;
  const condition = typeof raw.condition === "number" ? raw.condition : undefined;
  if (condition !== undefined) device.condition = condition;
  const notes = toOptionalString(raw.notes);
  if (notes !== undefined) device.notes = notes;

  const photos = raw.photos != null ? toStringList(raw.photos) : undefined;
  if (photos !== undefined) device.photos = photos;
  const related = raw.related != null ? toStringList(raw.related) : undefined;
  if (related !== undefined) device.related = related;

  return device;
}

export function normalizeCatalog(raw: unknown): Catalog {
  if (!isRecord(raw)) {
    throw new Error("catalog must be a mapping of category -> devices");
  }

  const out: Catalog = {};
  for (const [category, devices] of Object.entries(raw)) {
    if (!Array.isArray(devices)) {
      throw new Error(`category "${category}" must be a list of devices`);
    }
    out[category] = devices.map((device) => normalizeDevice(device, category));
  }
  return out;
}
