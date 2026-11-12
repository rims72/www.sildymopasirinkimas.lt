import {
  CALCULATORS,
  computeCalculator,
  en442OutputRatio,
  flowM3hFromKw,
  heatingDemandKw,
  kellDensity,
  lpgBill,
  pickTank,
  seasonalDemand,
} from "./calculators";

test("flow, heat demand and the standard radiator ratio match the app", () => {
  expect(flowM3hFromKw(8, 5)).toBe(1.38);
  expect(heatingDemandKw(120, "new")).toBe(6);
  expect(en442OutputRatio(75, 65)).toBe(1);
  expect(kellDensity(15)).toBeCloseTo(999.1, 1);
});

test("seasonal gas for the Vilnius example is 823 m3", () => {
  const season = seasonalDemand({ areaM2: 120, energyClass: "A+", occupants: 4, indoorC: 20 });
  expect(season.heatKwhYear).toBe(4452);
  expect(season.dhwKwhYear).toBe(2978);
  expect(season.gasM3Year).toBe(823);
  expect(season.seasonDays).toBe(212);
});

test("tank, freon and gas connection defaults", () => {
  expect(pickTank(4, "heat_pump").litres).toBe(200);
  expect(pickTank(4, "gas_boiler").litres).toBe(100);
  expect(computeCalculator("freono-trasa").rows[0][1]).toContain("15,88");
  expect(computeCalculator("dujotiekio-irengimas").numeric).toBe(1500);
});

test("propane cylinders use 12.8 kWh/kg and the opened 11 kg price", () => {
  const season = seasonalDemand({ areaM2: 120, energyClass: "A+", occupants: 4, indoorC: 20 });
  const total = season.heatRaw + season.dhwRaw;
  const bill = lpgBill(total, 11, 29.04);
  expect(Math.round(bill.kg)).toBe(611);
  expect(bill.cylindersToBuy).toBe(56);
  expect(Math.round(bill.eur)).toBe(1613);
  expect(Math.round(bill.purchaseEur)).toBe(1626);

  const year = computeCalculator("sildymo-kaina");
  const lpg = year.bills.find((row) => row.id === "lpg");
  expect(lpg.name).toBe("SND 11 kg");
  expect(Math.round(lpg.eur)).toBe(1613);
  expect(year.bills.find((row) => row.id === "floor").name).toBe("Grindys 2,3");
  expect(year.bills.find((row) => row.id === "rad").name).toBe("Radiatoriai 2,0");
  expect(year.note).toContain("−3…−5 °C");
  expect(year.note).toContain("apie 2");
  const cleared = computeCalculator("sildymo-kaina", { gasPrice: "", electricPrice: "", lpgPrice: "" });
  expect(Math.round(cleared.bills.find((row) => row.id === "gas").eur)).toBe(Math.round(year.bills.find((row) => row.id === "gas").eur));
  expect(Math.round(cleared.bills.find((row) => row.id === "lpg").eur)).toBe(1613);

  const dedicated = computeCalculator("suskystintos-dujos");
  expect(dedicated.headline).toBe("1613 €");
  expect(dedicated.link.href).toContain("prekiutinklas.lt");
});

test("system fluid adds 600 m of 16 mm pipe and glycol for a monoblock", () => {
  const fluid = computeCalculator("skyscio-kiekis");
  expect(fluid.rows.find((row) => row[0] === "Grindų vamzdžiai")[1]).toBe("67,9 l · 600 m");
  expect(fluid.rows.find((row) => row[0] === "Iš viso")[1]).toBe("74,9 l");
  expect(fluid.headline).toBe("24,7 l glikolio");
  const split = computeCalculator("skyscio-kiekis", { layout: "split" });
  expect(split.headline).toMatch(/l indas$/);
  expect(split.rows.find((row) => row[0] === "Glikolis")[1]).toBe("0 l");
  expect(split.note).toContain("Split");
});

test("every Hidraulika calculator plus propane is on the page list", () => {
  expect(CALCULATORS.map((item) => item.id)).toEqual([
    "silumos-poreikis",
    "debitas",
    "vamzdzio-dydis",
    "vamzdzio-nuostoliai",
    "grindiniai-konturai",
    "isspletimo-indas",
    "skyscio-kiekis",
    "boilerio-isspletimo-indas",
    "boilerio-talpa",
    "duju-suvartojimas",
    "sildymo-kaina",
    "suskystintos-dujos",
    "momentinis-kv",
    "freono-trasa",
    "radiatoriai-en442",
    "dujotiekio-vamzdis",
    "dujotiekio-irengimas",
  ]);
  CALCULATORS.forEach((item) => {
    const result = computeCalculator(item.id);
    expect(result.headline).not.toBe("–");
  });
});
