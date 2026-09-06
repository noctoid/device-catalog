import type { Catalog, Device } from "./types";

export function addDevice(catalog: Catalog, device: Device): Catalog {
  const devices = catalog[device.category] ?? [];
  return { ...catalog, [device.category]: [...devices, device] };
}

/** Replace a device by identifier; moves it across categories if `next.category` differs. */
export function updateDevice(catalog: Catalog, identifier: string, next: Device): Catalog {
  return addDevice(removeDevice(catalog, identifier), next);
}

export function removeDevice(catalog: Catalog, identifier: string): Catalog {
  const out: Catalog = {};
  for (const [category, devices] of Object.entries(catalog)) {
    const remaining = devices.filter((device) => device.identifier !== identifier);
    if (remaining.length > 0) out[category] = remaining;
  }
  return out;
}

export function findDevice(catalog: Catalog, identifier: string): Device | undefined {
  for (const devices of Object.values(catalog)) {
    const found = devices.find((device) => device.identifier === identifier);
    if (found) return found;
  }
  return undefined;
}

export function deviceCount(catalog: Catalog): number {
  return Object.values(catalog).reduce((total, devices) => total + devices.length, 0);
}
