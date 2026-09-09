import type { Catalog, Device } from "./types";

const IDENTIFIER_RE = /^[a-z0-9][a-z0-9-]*$/;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDevice(
  device: Device,
  catalog: Catalog,
  editingId?: string,
): ValidationResult {
  const errors: string[] = [];

  if (!device.identifier.trim()) {
    errors.push("identifier is required");
  } else if (!IDENTIFIER_RE.test(device.identifier)) {
    errors.push(
      "identifier must be lowercase letters, digits, and hyphens (no leading hyphen)",
    );
  } else if (identifierExists(catalog, device.identifier, editingId)) {
    errors.push(`identifier "${device.identifier}" is already in use`);
  }

  if (!device.deviceType.trim()) errors.push("device-type is required");

  const hasLabel =
    (device.name ?? "").trim() !== "" || (device.nickname ?? "").trim() !== "";
  if (!hasLabel) errors.push("name or nickname is required");

  if (device.condition != null && (device.condition < 0 || device.condition > 1)) {
    errors.push("condition must be between 0 and 1");
  }

  return { valid: errors.length === 0, errors };
}

function identifierExists(catalog: Catalog, identifier: string, editingId?: string): boolean {
  if (identifier === editingId) return false;
  return catalog.some((device) => device.identifier === identifier);
}
