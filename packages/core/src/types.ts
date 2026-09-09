/** A structured measured quantity, e.g. `{ value: 32, unit: "gb", type: "ddr4-uecc" }`. */
export type Quantity = {
  value: number;
  unit: string;
  type?: string;
};

export type SpecValue =
  | string
  | number
  | Quantity
  | SpecValue[]
  | { [key: string]: SpecValue };

export interface Device {
  /** Unique slug; primary key. */
  identifier: string;
  /** Kind of device: "computer", "camera", … */
  deviceType: string;
  /** Manufacturer product name ("Nikon D100", "Power Mac G5"). Absent for custom builds. */
  name?: string;
  /** Personal label ("Fairy", "P2"). Absent when the product name is the label. */
  nickname?: string;
  keywords: string[];
  chassis?: string;
  /** Installed operating systems; empty list when unknown. */
  os: string[];
  purpose: string[];
  specs: Record<string, SpecValue>;
  serial?: string;
  /** Acquisition date, YYYY-MM-DD. */
  acquired?: string;
  /** Physical condition: 0 (broken) to 1 (brand new). */
  condition?: number;
  notes?: string;
  /** Local filesystem paths; desktop-only rendering (web shows a placeholder). */
  photos?: string[];
  /** Identifiers of related devices. */
  related?: string[];
}

/** A catalog is a flat list of devices. */
export type Catalog = Device[];
