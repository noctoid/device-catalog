import type { Catalog, Device } from "./types";

export function addDevice(catalog: Catalog, device: Device): Catalog {
  return [...catalog, device];
}

/** Replace a device by identifier. */
export function updateDevice(catalog: Catalog, identifier: string, next: Device): Catalog {
  return catalog.map((device) => (device.identifier === identifier ? next : device));
}

export function removeDevice(catalog: Catalog, identifier: string): Catalog {
  return catalog.filter((device) => device.identifier !== identifier);
}

export function findDevice(catalog: Catalog, identifier: string): Device | undefined {
  return catalog.find((device) => device.identifier === identifier);
}

export function deviceCount(catalog: Catalog): number {
  return catalog.length;
}
