import yaml from "js-yaml";
import type { Catalog } from "./types";

export function parseCatalog(text: string): Catalog {
  const doc = yaml.load(text);
  if (doc == null) return {};
  if (typeof doc !== "object" || Array.isArray(doc)) {
    throw new Error("catalog YAML must be a mapping of category -> devices");
  }
  return doc as Catalog;
}

export function serializeCatalog(catalog: Catalog): string {
  return yaml.dump(catalog, {
    lineWidth: -1,
    noRefs: true,
    sortKeys: false,
  });
}
