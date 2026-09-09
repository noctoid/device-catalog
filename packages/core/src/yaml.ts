import yaml from "js-yaml";
import type { Catalog, Device } from "./types";

export function parseCatalog(text: string): Catalog {
  const doc = yaml.load(text);
  if (doc == null) return [];
  if (!Array.isArray(doc)) {
    throw new Error("catalog YAML must be a list of devices");
  }
  return doc as Catalog;
}

/** Serialize a device to its YAML form, mapping `deviceType` to `device-type`. */
function toYamlDevice(device: Device): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(device)) {
    out[key === "deviceType" ? "device-type" : key] = value;
  }
  return out;
}

export function serializeCatalog(catalog: Catalog): string {
  return yaml.dump(catalog.map(toYamlDevice), {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
