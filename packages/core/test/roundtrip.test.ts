import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { deviceCount, findDevice, normalizeCatalog, parseCatalog, serializeCatalog } from "../src";

const yamlPath = fileURLToPath(new URL("../../../device-list.yaml", import.meta.url));
const source = readFileSync(yamlPath, "utf8");

describe("catalog round-trip", () => {
  const catalog = normalizeCatalog(parseCatalog(source));

  it("loads every device from the seed file", () => {
    expect(deviceCount(catalog)).toBe(29);
    expect(Object.keys(catalog)).toEqual(["computers", "cameras"]);
  });

  it("keeps os/purpose top-level and list-typed", () => {
    const jinni = findDevice(catalog, "jinni");
    expect(jinni?.os).toEqual(["arch-linux"]);
    expect(jinni?.purpose).toEqual(["nas", "storage"]);
    expect(jinni?.specs.os).toBeUndefined();
    expect(jinni?.specs.purpose).toBeUndefined();
    const p2 = findDevice(catalog, "p2");
    expect(p2?.os).toEqual([]);
  });

  it("splits nickname from product name", () => {
    const fairy = findDevice(catalog, "fairy");
    expect(fairy?.nickname).toBe("Fairy");
    expect(fairy?.name).toBe("Power Mac G5");
    const d100 = findDevice(catalog, "nikon-d100");
    expect(d100?.name).toBe("Nikon D100");
    expect(d100?.nickname).toBeUndefined();
  });

  it("structures capacities, resolutions, and lens ranges", () => {
    const fairy = findDevice(catalog, "fairy");
    expect(fairy?.specs.ram).toEqual({ value: 32, unit: "gb", type: "ddr4-uecc" });
    expect(fairy?.specs.hdd).toEqual([{ value: 4, unit: "tb" }]);
    expect(fairy?.specs["storage-model"]).toBe("crucial-p3-4t");
    const dp1 = findDevice(catalog, "sigma-dp1");
    expect(dp1?.specs.lens).toEqual({
      "focal-length": [16.6],
      "f-stop": [4],
      "equivalent-focal-length": [28],
    });
  });

  it("round-trips through serialize + parse unchanged", () => {
    const round = normalizeCatalog(parseCatalog(serializeCatalog(catalog)));
    expect(round).toEqual(catalog);
  });
});
