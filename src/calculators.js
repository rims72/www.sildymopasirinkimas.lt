/**
 * Hidraulika (Android) mažosios skaičiuoklės.
 * Skaičiai ir eiga paimti iš programėlės Hermes kodo, ne iš naujo sugalvoti.
 */

const WATER_KWH = 1.163;
const WATER_DENSITY = 988;
const WATER_NU = 5.53e-7;
const G = 9.81;
const PIPE_PER_M2 = 6.7;
const FLOOR_W_M2 = 70;
const LOOP_DELTA_K = 5;
const LOOP_DESIGN_KPA = 25;
const LOOP_EN_KPA = 35;
const LOOP_CONNECT_M = 10;
const MAX_VELOCITY = 1.25;
const PUMP_EFFICIENCY = 0.35;
const PUMP_FITTINGS_KPA = 10;
const DEFAULT_HP_DROP_KPA = 15;
const PLATE_HEX_DROP_KPA = 30;
const LOCAL_K = 0.5;
const BRANCHES_PER_COLLECTOR = 12;
const MIN_AREA = 40;
const MAX_AREA = 400;
const GAS_KWH = 9.5;
const GAS_EFFICIENCY = 0.95;
const GAS_DENSITY = 0.73;
const GAS_NU = 1.5e-5;
const GAS_SUPPLY_MBAR = 21;
const GAS_ATMOS_MBAR = 1013.25;
const GAS_ROUGHNESS_M = 4.5e-5;
const GAS_MAX_VELOCITY = 6;
const GAS_ALLOWABLE_PA = 300;
const GAS_FITTING_M = 0.5;
const HEATING_VESSELS = [8, 12, 18, 24, 35, 50, 80];
const DHW_VESSELS = [8, 12, 18, 24, 35, 50];
const EN442_N = 1.3;
const ROOM_AIR = 20;

const MONTHS = [
  { tC: -3.7, days: 31 },
  { tC: -3.1, days: 28 },
  { tC: 0.7, days: 31 },
  { tC: 7.4, days: 30 },
  { tC: 12.9, days: 31 },
  { tC: 16.3, days: 30 },
  { tC: 18.5, days: 31 },
  { tC: 17.6, days: 31 },
  { tC: 12.6, days: 30 },
  { tC: 6.8, days: 31 },
  { tC: 1.9, days: 30 },
  { tC: -2.0, days: 31 },
];

const ENERGY_CLASS = { "A++": 27.8, "A+": 37.1, A: 49.2, B: 125.4, old: 196 };
const INSULATION_W = { new: 50, renovated: 70, old: 100 };

const ROUGHNESS_M = {
  multilayer: 7e-6,
  pex: 7e-6,
  ppr: 7e-6,
  copper: 1.5e-6,
  steel: GAS_ROUGHNESS_M,
  press: GAS_ROUGHNESS_M,
};

const MAIN_PIPES = {
  multilayer: [
    ["20 mm", 16],
    ["26 mm", 20],
    ["32 mm", 26],
    ["40 mm", 33],
  ],
  press: [
    ["15 mm", 12.6],
    ["22 mm", 19],
    ["28 mm", 25],
  ],
  copper: [
    ["15 mm", 13],
    ["18 mm", 16],
    ["22 mm", 20],
    ["28 mm", 26],
    ["35 mm", 32.6],
  ],
  steel: [
    ["DN15", 16.1],
    ["DN20", 21.7],
    ["DN25", 27.3],
    ["DN32", 36],
    ["DN40", 41.9],
  ],
  ppr: [
    ["20 mm", 13.2],
    ["25 mm", 16.6],
    ["32 mm", 21.2],
    ["40 mm", 26.6],
    ["50 mm", 33.4],
  ],
};

const PIPE_KIND_NAME = {
  multilayer: "Daugiasluoksnis",
  press: "Press plienas",
  copper: "Varis",
  steel: "Plieninis",
  ppr: "PPR",
};

const DN_INNER = { 16: 12, 20: 16, 25: 20.4, 32: 26.2, 40: 33, 50: 41, 63: 51.4 };

const GAS_PIPES = [
  ["steel", "DN15", 16.1],
  ["steel", "DN20", 21.7],
  ["steel", "DN25", 27.3],
  ["steel", "DN32", 36],
  ["steel", "DN40", 41.9],
  ["copper", "15 mm", 13],
  ["copper", "18 mm", 16],
  ["copper", "22 mm", 20],
  ["copper", "28 mm", 26],
  ["pe", "20 mm", 16.2],
  ["pe", "25 mm", 20.4],
  ["pe", "32 mm", 26.2],
  ["pe", "40 mm", 32.6],
];

const GAS_KIND_NAME = { steel: "plieninis", copper: "varinis", pe: "PE" };

const PANEL_L_PER_M = {
  11: { 300: 1.7, 500: 2.7, 600: 3.2, 900: 4.5 },
  22: { 300: 3.4, 500: 5.5, 600: 6.4, 900: 9.0 },
  33: { 300: 5.1, 500: 8.2, 600: 9.6, 900: 13.5 },
};

const TANK_GAS = [
  { litres: 100, m2: 1 },
  { litres: 120, m2: 0.9 },
  { litres: 150, m2: 1 },
  { litres: 200, m2: 1 },
  { litres: 250, m2: 1.4 },
  { litres: 300, m2: 1.8 },
];
const TANK_HP = [
  { litres: 150, m2: 2 },
  { litres: 200, m2: 2.1 },
  { litres: 300, m2: 2.6 },
];

const FREON = [
  { maxKw: 6, liquidMm: 6.35, gasMm: 12.7, liquidInch: '1/4"', gasInch: '1/2"' },
  { maxKw: 8, liquidMm: 6.35, gasMm: 15.88, liquidInch: '1/4"', gasInch: '5/8"' },
  { maxKw: 12, liquidMm: 9.52, gasMm: 15.88, liquidInch: '3/8"', gasInch: '5/8"' },
  { maxKw: 99, liquidMm: 9.52, gasMm: 19.05, liquidInch: '3/8"', gasInch: '3/4"' },
];

const GAS_CONNECTION = {
  boundary: { label: "Prie sklypo ribos", low: 1500, high: 2000 },
  wall: { label: "Prie namo sienos", low: 800, high: 1100 },
};

/** Grynas propanas. 12,8 kWh/kg ir 29,04 € / 11 kg — atidarytas PropanGAS lapas 2026-11-03. Depozitas ne kuras. */
export const LPG = {
  kwhPerKg: 12.8,
  efficiency: GAS_EFFICIENCY,
  cylinderKg: 11,
  priceEur: 29.04,
  url: "https://www.prekiutinklas.lt/propangas-dujos-11-kg-27-l-balione",
  shop: "Prekių tinklas",
  product: "PropanGAS 11 kg / 27 l",
  checkedOn: "2026-11-03",
  depositEur: 200,
};

export function lpgBill(totalKwh, cylinderKg, priceEur) {
  const kg = Math.max(0, totalKwh) / (LPG.kwhPerKg * LPG.efficiency);
  const size = Math.max(1, cylinderKg);
  const cylinders = kg / size;
  const cylindersToBuy = Math.ceil(Math.round(cylinders * 1e6) / 1e6);
  return {
    kg,
    cylinders,
    cylindersToBuy,
    eur: cylinders * priceEur,
    purchaseEur: cylindersToBuy * priceEur,
  };
}

export function pipeSizeOptions(material) {
  const catalog = material === "multilayer"
    ? [["16 mm", 12], ...MAIN_PIPES.multilayer]
    : MAIN_PIPES[material] || MAIN_PIPES.multilayer;
  return [["auto", "Parinkti"], ...catalog.map(([label]) => [label, label])];
}

export function fmt(value, digits) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "–";
  return number.toFixed(digits).replace(".", ",");
}

export function plural(count, one, few, many) {
  const n10 = count % 10;
  const n100 = count % 100;
  const teens = n100 >= 11 && n100 <= 19;
  if (n10 === 1 && !teens) return one;
  if (n10 === 0 || teens) return many;
  return few;
}

export function flowM3hFromKw(kw, deltaK = 5) {
  const power = Math.max(0.05, kw);
  const delta = Math.max(3, deltaK);
  return Math.round((power / (WATER_KWH * delta)) * 100) / 100;
}

export function velocityMps(flowM3h, innerMm) {
  const radiusM = innerMm / 2000;
  const area = Math.PI * radiusM * radiusM;
  const flow = Math.max(0, flowM3h) / 3600;
  return flow / Math.max(area, 1e-9);
}

export function frictionKpa(lengthM, flowM3h, innerMm, material) {
  const diameter = innerMm / 1000;
  const area = Math.PI * (innerMm / 2000) ** 2;
  const velocity = Math.max(0, flowM3h) / 3600 / Math.max(area, 1e-9);
  const reynolds = (velocity * diameter) / WATER_NU;
  const roughness = ROUGHNESS_M[material] ?? ROUGHNESS_M.multilayer;
  let lambda;
  if (reynolds < 2300) {
    lambda = 64 / Math.max(reynolds, 1);
  } else {
    const term = (roughness / diameter / 3.7) ** 1.11 + 6.9 / reynolds;
    const inv = -1.8 * Math.log10(Math.max(term, 1e-12));
    lambda = 1 / (inv * inv);
  }
  const length = Math.max(0.1, lengthM);
  const pascal = lambda * (length / diameter) * WATER_DENSITY * velocity * velocity / 2;
  return pascal / 1000;
}

export function localKpa(kFactor, flowM3h, innerMm) {
  const velocity = velocityMps(flowM3h, innerMm);
  return (kFactor * WATER_DENSITY * velocity * velocity) / 2 / 1000;
}

export function kellDensity(celsius) {
  const t = Math.min(100, Math.max(0, celsius));
  return (
    999.842594 +
    0.06793952 * t -
    0.00909529 * t * t +
    0.0001001685 * t ** 3 -
    1.120083e-6 * t ** 4 +
    6.536332e-9 * t ** 5
  );
}

export function expansionPercent(fillC, maxC) {
  const cold = kellDensity(fillC);
  const hot = Math.max(kellDensity(maxC), 1);
  return Math.max(0, (cold / hot - 1) * 100);
}

export function roundVesselSize(litres, sizes) {
  const need = Math.max(0, litres);
  return sizes.find((size) => size >= need) ?? sizes[sizes.length - 1];
}

export function expansionVessel({ systemL, fillC, maxC, p0Bar, safetyValveBar, kind }) {
  const volume = Math.max(0, systemL);
  const p0 = Math.max(0.7, p0Bar);
  const pe = Math.max(p0 + 0.3, safetyValveBar * 0.9);
  const percent = expansionPercent(fillC, maxC);
  const ve = (percent / 100) * volume;
  const acceptance = (pe - p0) / (pe + 1);
  const sizes = kind === "dhw" ? DHW_VESSELS : HEATING_VESSELS;
  const useful = (reserve) => (acceptance > 0 ? (ve + reserve) / acceptance : ve + reserve);
  let reserve = Math.max(0.005 * volume, 3);
  let exact = useful(reserve);
  let size = roundVesselSize(exact, sizes);
  for (let step = 0; step < 4; step += 1) {
    reserve = size <= 15 ? size * 0.2 : Math.max(0.005 * volume, 3);
    exact = useful(reserve);
    const next = roundVesselSize(exact, sizes);
    if (next === size) break;
    size = next;
  }
  return {
    percent: Math.round(percent * 1000) / 1000,
    veL: Math.round(ve * 100) / 100,
    reserveL: Math.round(reserve * 100) / 100,
    peBar: Math.round(pe * 100) / 100,
    p0Bar: Math.round(p0 * 100) / 100,
    exactL: Math.round(exact * 100) / 100,
    sizeL: size,
  };
}

function maxLoopLengthM(pipeMm, limitKpa) {
  let lo = 10;
  let hi = 250;
  const inner = pipeMm === 18 ? 14 : 12;
  for (let step = 0; step < 40; step += 1) {
    const mid = (lo + hi) / 2;
    const kilowatts = Math.max(0.05, (Math.max(0, mid / PIPE_PER_M2) * FLOOR_W_M2) / 1000);
    const flow = kilowatts / (WATER_KWH * Math.max(3, LOOP_DELTA_K));
    const pressure = frictionKpa(mid + LOOP_CONNECT_M, flow, inner, "pex");
    if (pressure <= limitKpa) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo);
}

export function floorLoopCount(area, pipeMm = 16) {
  if (!(area > 0)) return 0;
  const pipe = pipeMm === 18 ? 18 : 16;
  const maxLength = maxLoopLengthM(pipe, LOOP_DESIGN_KPA);
  const areaPerLoop = Math.floor((maxLength / PIPE_PER_M2) * 10) / 10;
  return Math.max(1, Math.ceil(area / areaPerLoop));
}

export function sizeFloorLoops(area, pipeMm = 16) {
  const pipe = pipeMm === 18 ? 18 : 16;
  const loops = Math.max(1, floorLoopCount(area, pipe));
  const loopArea = Math.round((area / loops) * 10) / 10;
  const loopPipe = Math.round(loopArea * PIPE_PER_M2);
  const inner = pipe === 18 ? 14 : 12;
  const kilowatts = Math.max(0.05, (Math.max(0, loopArea) * FLOOR_W_M2) / 1000);
  const flow = flowM3hFromKw(kilowatts, LOOP_DELTA_K);
  const pressure = Math.round(frictionKpa(loopPipe + LOOP_CONNECT_M, flow, inner, "pex") * 10) / 10;
  return {
    pipeMm: pipe,
    loops,
    loopAreaM2: loopArea,
    loopPipeM: loopPipe,
    totalPipeM: loopPipe * loops,
    maxLengthM: maxLoopLengthM(pipe, LOOP_DESIGN_KPA),
    maxEnLengthM: maxLoopLengthM(pipe, LOOP_EN_KPA),
    pressureKpa: pressure,
    flowM3h: flow,
    velocityMps: Math.round(velocityMps(flow, inner) * 100) / 100,
  };
}

export function heatingDemandKw(area, insulation) {
  const specific = INSULATION_W[insulation] ?? INSULATION_W.new;
  return Math.round(((area * specific) / 1000) * 10) / 10;
}

function pickPipe(flowM3h, catalog) {
  const ranked = catalog.map(([sizeLabel, innerMm]) => {
    const velocity = velocityMps(flowM3h, innerMm);
    return { sizeLabel, innerMm, velocity, ok: velocity <= MAX_VELOCITY + 1e-9 };
  });
  return ranked.find((pipe) => pipe.ok) || { ...ranked[ranked.length - 1], overVelocity: true };
}

function pipeWaterLitres(innerMm, lengthM) {
  const radius = innerMm / 2000;
  return Math.PI * radius * radius * Math.max(0, lengthM) * 1000;
}

const GLYCOL_SHARE = { "-10": 0.25, "-15": 0.33, "-20": 0.40, "-25": 0.45 };

function round1(value) {
  return Math.round(value * 10) / 10;
}

export function lmtd(supplyC, returnC, airC = ROOM_AIR) {
  const inlet = supplyC - airC;
  const outlet = returnC - airC;
  if (!(inlet > 0) || !(outlet > 0) || !(returnC < supplyC)) return 0;
  if (Math.abs(inlet - outlet) < 1e-9) return inlet;
  return (inlet - outlet) / Math.log(inlet / outlet);
}

export function en442OutputRatio(supplyC, returnC, airC = ROOM_AIR, exponent = EN442_N) {
  const actual = lmtd(supplyC, returnC, airC);
  const standard = lmtd(75, 65, airC);
  if (!(actual > 0) || !(standard > 0)) return 0;
  return (actual / standard) ** exponent;
}

export function seasonalDemand({ areaM2, energyClass, occupants, indoorC = 20, nightSetback = true, classKw = 24 }) {
  const design = 20;
  const day = indoorC == null ? design : indoorC;
  const night = nightSetback === false ? day : day - 2;
  const season = MONTHS.filter((month) => month.tC < 12).map((month) => {
    const hdd = ((16 * Math.max(0, day - month.tC) + 8 * Math.max(0, night - month.tC)) / 24) * month.days;
    return { ...month, hdd };
  });
  const designSeason = MONTHS.filter((month) => month.tC < 12);
  const designHdd = designSeason.reduce((sum, month) => {
    const hdd = ((16 * Math.max(0, design - month.tC) + 8 * Math.max(0, design - 2 - month.tC)) / 24) * month.days;
    return sum + hdd;
  }, 0);
  const hdd = season.reduce((sum, month) => sum + month.hdd, 0);
  const seasonDays = season.reduce((sum, month) => sum + month.days, 0);
  const scale = day === design || !(designHdd > 0) ? 1 : hdd / designHdd;
  const kwhM2 = ENERGY_CLASS[energyClass] ?? ENERGY_CLASS["A+"];
  const heat = areaM2 * kwhM2 * scale;
  const dhw = occupants * 0.04 * 51 * 365;
  const total = heat + dhw;
  const gasFactor = GAS_KWH * GAS_EFFICIENCY;
  const dhwPerDay = dhw / 365;
  const heatPerDay = seasonDays > 0 ? heat / seasonDays : 0;
  const gasDay = (heatPerDay + dhwPerDay) / gasFactor;
  const monthGas = season.map((month) => {
    const heatPart = hdd > 0 ? heat * (month.hdd / hdd) : 0;
    return (heatPart + dhwPerDay * month.days) / gasFactor;
  });
  const gasMonth = monthGas.length ? monthGas.reduce((sum, value) => sum + value, 0) / monthGas.length : 0;
  const outdoor = -23;
  return {
    heatKwhYear: Math.round(heat),
    dhwKwhYear: Math.round(dhw),
    totalKwhYear: Math.round(total),
    gasM3Year: Math.round(total / gasFactor),
    gasM3Day: Math.round(gasDay * 100) / 100,
    gasM3Week: Math.round(gasDay * 7 * 10) / 10,
    gasM3Month: Math.round(gasMonth * 10) / 10,
    peakM3h: Math.round((classKw / GAS_KWH) * 100) / 100,
    hdd: Math.round(hdd),
    seasonDays,
    fullLoadHours: outdoor < day ? Math.round((24 * hdd) / (day - outdoor)) : 0,
    kwhM2,
    heatRaw: heat,
    dhwRaw: dhw,
  };
}

export function pickTank(occupants, source) {
  const people = occupants;
  const occupancy = people * 50;
  const warnings = [];
  if (source === "gas_boiler") {
    let litres = 100;
    if (people >= 7) litres = 200;
    else if (people >= 5) litres = 150;
    const row = TANK_GAS.find((item) => litres <= item.litres) || TANK_GAS[TANK_GAS.length - 1];
    if (row.m2 + 1e-9 < 1) warnings.push("Katilui reikia ≥1 m² gyvatuko.");
    return { litres, coilM2: row.m2, occupancyL: occupancy, warnings };
  }
  const litres = people <= 2 ? 150 : 200;
  const row = TANK_HP.find((item) => litres <= item.litres) || TANK_HP[TANK_HP.length - 1];
  if (row.m2 + 1e-9 < 2) warnings.push(`Šilumos siurbliui reikia ≥2 m² gyvatuko — ${litres} l talpa su ${fmt(row.m2, 1)} m² netinka.`);
  if (occupancy > litres * 1.2) warnings.push(`Pagal 50 l/žm. išeitų ${fmt(occupancy, 0)} l, bet SS boilerį riboja gyvatukas, ne žmonių skaičius.`);
  return { litres, coilM2: row.m2, occupancyL: occupancy, warnings };
}

function gasFrictionPa(lengthM, flowM3h, innerMm) {
  const diameter = innerMm / 1000;
  const area = Math.PI * (innerMm / 2000) ** 2;
  const velocity = (flowM3h / 3600) / Math.max(area, 1e-9);
  const reynolds = (velocity * diameter) / GAS_NU;
  let lambda;
  if (reynolds < 2300) lambda = 64 / Math.max(reynolds, 1);
  else {
    const term = (GAS_ROUGHNESS_M / diameter / 3.7) ** 1.11 + 6.9 / reynolds;
    const inv = -1.8 * Math.log10(Math.max(term, 1e-12));
    lambda = 1 / (inv * inv);
  }
  const density = GAS_DENSITY * ((GAS_ATMOS_MBAR + GAS_SUPPLY_MBAR) / GAS_ATMOS_MBAR);
  const length = Math.max(0.1, lengthM);
  return lambda * (length / diameter) * density * velocity * velocity / 2;
}

export function sizeGasPipe({ powerKw, lengthM, fittings, appliances }) {
  const flow = Math.round(((powerKw * Math.max(1, appliances)) / GAS_KWH) * 100) / 100;
  const equivalent = Math.max(0.5, lengthM) + Math.max(0, fittings) * GAS_FITTING_M;
  const all = GAS_PIPES.map(([kind, sizeLabel, innerMm]) => {
    const velocity = velocityMps(flow, innerMm);
    const dropPa = gasFrictionPa(equivalent, flow, innerMm);
    const ok = velocity <= GAS_MAX_VELOCITY + 1e-9 && dropPa <= GAS_ALLOWABLE_PA + 1e-6;
    return { kind, sizeLabel, innerMm, velocity, dropPa, ok };
  });
  const firstOfKind = ["steel", "copper", "pe"]
    .map((kind) => all.find((pipe) => pipe.kind === kind && pipe.ok))
    .filter(Boolean);
  const chosen = firstOfKind[0] || all[all.length - 1];
  return { flow, equivalent, chosen, firstOfKind, all, withinLimit: firstOfKind.length > 0 };
}

function num(value, fallback) {
  if (value === "" || value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampArea(area) {
  const rounded = Math.round(num(area, 120) / 10) * 10;
  return Math.min(MAX_AREA, Math.max(MIN_AREA, rounded));
}

const choice = (key, label, options, value, show) => ({ key, label, type: "choice", options, value, show });
const number = (key, label, value, extra = {}) => ({ key, label, type: "number", value, ...extra });

export const CALCULATORS = [
  {
    id: "silumos-poreikis",
    name: "Šilumos poreikis",
    description: "Kiek kilovatų reikia namui pagal plotą ir apšiltinimą.",
    fields: [
      number("area", "Bendras plotas, m²", 120, { min: 40, max: 400, step: 10 }),
      choice("insulation", "Apšiltinimas", [
        ["new", "Naujas (A+)"],
        ["renovated", "Renovuotas"],
        ["old", "Senas"],
      ], "new"),
    ],
  },
  {
    id: "debitas",
    name: "Debitas",
    description: "Vandens srautas m³/h pagal galią ir temperatūrų skirtumą.",
    fields: [
      number("power", "Galia, kW", 8, { min: 1, max: 40, step: 0.5 }),
      number("delta", "ΔT, K", 5, { min: 3, max: 12, step: 1 }),
    ],
  },
  {
    id: "vamzdzio-dydis",
    name: "Vamzdžio dydis",
    description: "Vamzdis pagal galią arba srautą — tikri tipai, greitis apie 1,25 m/s.",
    fields: [
      choice("input", "Įvestis", [["power", "Galia kW"], ["flow", "Srautas m³/h"], ["ls", "Srautas l/s"]], "flow"),
      number("power", "Galia, kW", 8, { min: 1, max: 40, step: 0.5, show: (v) => v.input === "power" }),
      number("flow", "Srautas, m³/h", 1.03, { min: 0.1, max: 6, step: 0.05, show: (v) => v.input === "flow" }),
      number("flowLs", "Srautas, l/s", 0.29, { min: 0.03, max: 1.7, step: 0.01, show: (v) => v.input === "ls" }),
      number("delta", "ΔT, K", 5, { min: 3, max: 12, step: 1, show: (v) => v.input === "power" }),
      choice("material", "Medžiaga", Object.entries(PIPE_KIND_NAME), "multilayer"),
      choice("forced", "Vamzdis", [["auto", "Parinkti"]], "auto"),
    ],
  },
  {
    id: "vamzdzio-nuostoliai",
    name: "Kolektorius ir siurblys",
    description: "Iš namo ploto — kiek šakų kolektoriui ir kokio cirkuliacinio reikia.",
    fields: [
      number("area", "Namo plotas, m²", 120, { min: 40, max: 400, step: 10 }),
      number("length", "Trasa iki kolektoriaus, m", 5, { min: 1, max: 10, step: 1 }),
      choice("material", "Magistralė", Object.entries(PIPE_KIND_NAME), "multilayer"),
      choice("hex", "Šilumokaitis", [["hex", "Su šilumokaičiu"], ["none", "Be šilumokaičio"]], "hex"),
    ],
  },
  {
    id: "grindiniai-konturai",
    name: "Grindiniai kontūrai",
    description: "Į kiek kontūrų dalinti plotą, kad slėgio nuostolis neviršytų ribos.",
    fields: [
      number("area", "Grindinio plotas, m²", 108, { min: 10, max: 300, step: 5 }),
      choice("pipeMm", "Vamzdis", [["16", "16 mm"], ["18", "18 mm"]], "16"),
    ],
  },
  {
    id: "isspletimo-indas",
    name: "Išsiplėtimo indas",
    description: "Indo tūris iš prietaisų ir vamzdžių vandens, ne iš kW klasės.",
    fields: [
      choice("heating", "Šildymas", [["floor", "Grindinis"], ["radiators", "Radiatoriai"]], "floor"),
      choice("radMethod", "Radiatoriai pagal", [["size", "Matmenis"], ["power", "Vardinę galią"]], "size", (v) => v.heating === "radiators"),
      choice("type", "Tipas", [["11", "11"], ["22", "22"], ["33", "33"]], "22", (v) => v.heating === "radiators" && v.radMethod === "size"),
      number("length", "Ilgis, mm", 1000, { min: 400, max: 2000, step: 100, show: (v) => v.heating === "radiators" && v.radMethod === "size" }),
      choice("height", "Aukštis, mm", [["300", "300"], ["500", "500"], ["600", "600"], ["900", "900"]], "600", (v) => v.heating === "radiators" && v.radMethod === "size"),
      number("count", "Kiekis, vnt.", 8, { min: 1, max: 40, step: 1, show: (v) => v.heating === "radiators" }),
      number("watts", "Vardinė galia 75/65/20, W", 1670, { min: 200, max: 4000, step: 50, show: (v) => v.heating === "radiators" && v.radMethod === "power" }),
      number("area", "Grindinio plotas, m²", 120, { min: 10, max: 400, step: 5, show: (v) => v.heating === "floor" }),
      choice("pipeMm", "Grindų vamzdis", [["16", "16 mm"], ["18", "18 mm"]], "16", (v) => v.heating === "floor"),
      number("pipeM", "Magistralės ilgis, m", 40, { min: 0, max: 200, step: 5, show: (v) => v.heating === "radiators" }),
      choice("pipeDn", "Magistralės DN", [["16", "DN16"], ["20", "DN20"], ["25", "DN25"], ["32", "DN32"]], "20", (v) => v.heating === "radiators"),
      choice("source", "Šaltinis", [["split", "Šilumos siurblys"], ["gas_boiler", "Dujinis katilas"]], "split"),
      number("knownL", "Žinomas sistemos tūris, l (0 = skaičiuoti)", 0, { min: 0, max: 1200, step: 20 }),
    ],
  },
  {
    id: "skyscio-kiekis",
    name: "Sistemos skystis",
    description: "Kiek litrų telpa grindyse, siurblyje ir talpoje, ir kiek glikolio reikia monoblokui.",
    fields: [
      choice("layout", "Sistema", [["mono", "Monoblokas"], ["split", "Split"]], "mono"),
      choice("floorMm", "Grindų vamzdis", [["16", "16 mm"], ["18", "18 mm"]], "16"),
      number("floorM", "Grindų vamzdžio ilgis, m", 600, { min: 0, max: 3000, step: 10 }),
      choice("mainDn", "Magistralė", [["0", "Nėra"], ["20", "20 mm"], ["25", "25 mm"], ["32", "32 mm"]], "0"),
      number("mainM", "Magistralės ilgis, m", 0, { min: 0, max: 200, step: 5, show: (v) => v.mainDn !== "0" }),
      number("hpL", "Siurblio vandens tūris, l", 5, { min: 0, max: 30, step: 0.5 }),
      number("bufferL", "Akumuliacinė talpa, l", 0, { min: 0, max: 2000, step: 10 }),
      number("extraL", "Kolektoriai ir kita, l", 2, { min: 0, max: 50, step: 1 }),
      choice("freeze", "Neužšalti iki", [
        ["-10", "−10 °C · apie 25 %"],
        ["-15", "−15 °C · apie 33 %"],
        ["-20", "−20 °C · apie 40 %"],
        ["-25", "−25 °C · apie 45 %"],
      ], "-15", (v) => v.layout === "mono"),
    ],
  },
  {
    id: "boilerio-isspletimo-indas",
    name: "Boilerio išsiplėtimo indas",
    description: "Karšto vandens talpos indas — atskiras nuo šildymo, ΔT apie 15→60 °C.",
    fields: [
      choice("litres", "Talpa, l", ["100", "120", "150", "200", "250", "300"].map((value) => [value, value]), "200"),
    ],
  },
  {
    id: "boilerio-talpa",
    name: "Boilerio talpa",
    description: "Karšto vandens talpa pagal gyvatuko plotą ir šilumos šaltinį.",
    fields: [
      number("occupants", "Gyventojai", 4, { min: 1, max: 8, step: 1 }),
      choice("source", "Šaltinis", [["split", "Šilumos siurblys"], ["gas_boiler", "Dujinis katilas"]], "split"),
    ],
  },
  {
    id: "duju-suvartojimas",
    name: "Dujų suvartojimas",
    description: "Kiek dujų sunaudos namas per dieną, savaitę, mėnesį ir metus.",
    fields: [
      number("classKw", "Katilo klasė, kW", 24, { min: 12, max: 45, step: 1 }),
      number("area", "Plotas, m²", 120, { min: 40, max: 400, step: 10 }),
      choice("energyClass", "Energijos klasė", [["A++", "A++"], ["A+", "A+"], ["A", "A"], ["B", "B"], ["old", "Senas (be klasės)"]], "A+"),
      number("occupants", "Gyventojai", 4, { min: 1, max: 8, step: 1 }),
    ],
  },
  {
    id: "sildymo-kaina",
    name: "Šildymo kaina",
    description: "Dujų, suskystintų dujų, šilumos siurblio prie žiemos COP ir elektros metinė sąskaita.",
    fields: [
      number("area", "Plotas, m²", 120, { min: 40, max: 400, step: 10 }),
      choice("energyClass", "Energijos klasė", [["A++", "A++ · 27,8"], ["A+", "A+ · 37,1"], ["A", "A · 49,2"], ["B", "B · 125,4"], ["old", "Senas · 196"]], "A+"),
      number("occupants", "Gyventojai", 4, { min: 1, max: 8, step: 1 }),
      number("indoor", "Vidaus temperatūra, °C", 20, { min: 16, max: 26, step: 1 }),
      number("gasPrice", "Dujų kaina, €/m³", 1, { min: 0.2, max: 3, step: 0.05 }),
      number("electricPrice", "Elektros kaina, €/kWh", 0.2, { min: 0.05, max: 1, step: 0.01 }),
      number("scopFloor", "COP grindims (rekomenduojamas 2,3)", 2.3, { min: 1, max: 6, step: 0.1 }),
      number("scopRad", "COP radiatoriams (rekomenduojamas 2,0)", 2, { min: 1, max: 6, step: 0.1 }),
      choice("lpgKg", "SND balionas", [["11", "11 kg (27 l)"], ["19", "19 kg (46 l)"], ["21", "21 kg (50 l)"], ["33", "33 kg (79 l)"]], "11"),
      number("lpgPrice", "Vieno baliono kaina, €", LPG.priceEur, { min: 1, max: 400, step: 0.01 }),
    ],
  },
  {
    id: "suskystintos-dujos",
    name: "Suskystintos dujos",
    description: "Kiek kainuoja šildyti per metus propano balionais.",
    fields: [
      number("area", "Plotas, m²", 120, { min: 40, max: 400, step: 10 }),
      choice("energyClass", "Energijos klasė", [["A++", "A++ · 27,8"], ["A+", "A+ · 37,1"], ["A", "A · 49,2"], ["B", "B · 125,4"], ["old", "Senas · 196"]], "A+"),
      number("occupants", "Gyventojai", 4, { min: 1, max: 8, step: 1 }),
      number("indoor", "Vidaus temperatūra, °C", 20, { min: 16, max: 26, step: 1 }),
      choice("lpgKg", "Balionas", [["11", "11 kg (27 l)"], ["19", "19 kg (46 l)"], ["21", "21 kg (50 l)"], ["33", "33 kg (79 l)"]], "11"),
      number("lpgPrice", "Vieno baliono kaina, €", LPG.priceEur, { min: 1, max: 400, step: 0.01 }),
    ],
  },
  {
    id: "momentinis-kv",
    name: "Momentinis karštas vanduo",
    description: "Kokios galios reikia vandeniui šildyti be talpos.",
    fields: [
      number("occupants", "Gyventojai", 4, { min: 1, max: 8, step: 1 }),
      choice("delta", "Pakėlimas", [["30", "+30 K"], ["35", "+35 K"], ["40", "+40 K"]], "35"),
    ],
  },
  {
    id: "freono-trasa",
    name: "Freono trasa",
    description: "Split sistemos vamzdelių dydžiai pagal galios klasę.",
    fields: [
      choice("classKw", "Galios klasė, kW", [["6", "6"], ["8", "8"], ["12", "12"], ["14", "14"]], "8"),
    ],
  },
  {
    id: "radiatoriai-en442",
    name: "Radiatoriai žemai temperatūrai",
    description: "EN 442 katalogo galia prie 40–60 °C ir ar reikia maišymo.",
    fields: [
      number("duty", "Patalpos poreikis, kW", 1.5, { min: 0.3, max: 12, step: 0.1 }),
      choice("regime", "Tiekimas, °C", [["40", "40/33"], ["45", "45/40"], ["50", "50/40"], ["55", "55/45"], ["60", "60/50"]], "40"),
    ],
  },
  {
    id: "dujotiekio-vamzdis",
    name: "Dujotiekio vamzdyno parinkimas",
    description: "Kokį vamzdį dėti pagal įrenginio galią, atstumą ir alkūnes. 21 mbar, ΔP ≤ 3 mbar.",
    fields: [
      number("power", "Galia, kW", 15, { min: 4, max: 45, step: 1 }),
      number("length", "Ilgis, m", 12, { min: 2, max: 80, step: 1 }),
      number("fittings", "Alkūnės, vnt.", 4, { min: 0, max: 20, step: 1 }),
      number("appliances", "Prietaisai, vnt.", 1, { min: 1, max: 4, step: 1 }),
    ],
  },
  {
    id: "dujotiekio-irengimas",
    name: "Dujotiekio įrengimas",
    description: "Dujų įvado kaina pagal tai, kur stovi spinta — prie sklypo ribos ar prie namo sienos.",
    fields: [
      choice("place", "Spintos vieta", [["boundary", "Prie sklypo ribos"], ["wall", "Prie namo sienos"]], "boundary"),
    ],
  },
];

function defaultsOf(id) {
  const calculator = CALCULATORS.find((item) => item.id === id);
  return Object.fromEntries(calculator.fields.map((field) => [field.key, field.value]));
}

export function defaultValues(id) {
  return defaultsOf(id);
}

function regimeReturn(supply) {
  if (supply === 40) return 33;
  if (supply <= 45) return supply - 5;
  return supply - 10;
}

function heatingVolume(values) {
  const known = num(values.knownL, 0);
  const source = values.source === "gas_boiler" ? "gas_boiler" : "heat_pump";
  if (known > 0) {
    return { totalL: known, measured: true, note: `Įvestas išmatuotas šildymo tūris ${fmt(known, 0)} l — prietaisai čia nesumuojami.` };
  }
  let emitters = 0;
  let pipes = 0;
  if (values.heating === "radiators") {
    const count = Math.max(1, num(values.count, 8));
    if (values.radMethod === "power") {
      const one = Math.round((Math.max(0, num(values.watts, 1670)) / 100) * 0.4 * 100) / 100;
      emitters = Math.round(count * one * 10) / 10;
    } else {
      const type = PANEL_L_PER_M[num(values.type, 22)] || PANEL_L_PER_M[22];
      const perM = type[num(values.height, 600)] ?? type[600];
      emitters = Math.round(perM * (num(values.length, 1000) / 1000) * count * 10) / 10;
    }
    const dn = DN_INNER[num(values.pipeDn, 20)] ?? 16;
    pipes = Math.round(pipeWaterLitres(dn, num(values.pipeM, 40)) * 10) / 10;
  } else {
    const loops = sizeFloorLoops(Math.max(0, num(values.area, 120)), num(values.pipeMm, 16));
    const perM = num(values.pipeMm, 16) === 18 ? 0.154 : 0.113;
    emitters = Math.round(loops.totalPipeM * perM * 10) / 10;
  }
  const sourceL = source === "gas_boiler" ? 3 : 5;
  const manifolds = 2;
  const total = Math.round((emitters + pipes + sourceL + manifolds) * 10) / 10;
  return { totalL: total, emitters, pipes, sourceL, manifolds, measured: false };
}

function result(headlineLabel, headline, numeric, rows, note) {
  return { headlineLabel, headline, numeric, rows, note };
}

export function computeCalculator(id, raw = {}) {
  const values = { ...defaultsOf(id), ...raw };
  switch (id) {
    case "silumos-poreikis": {
      const area = num(values.area, 120);
      const kw = heatingDemandKw(area, values.insulation);
      const specific = INSULATION_W[values.insulation] ?? 50;
      return result("Šilumos poreikis", `${fmt(kw, 1)} kW`, kw, [
        ["Savitasis poreikis", `${specific} W/m²`],
        ["Šildomas plotas", `${fmt(area * 0.9, 0)} m²`],
      ], "Praktikos W/m², ne EN 12831. Karštas vanduo neįskaičiuotas.");
    }
    case "debitas": {
      const flow = flowM3hFromKw(num(values.power, 8), num(values.delta, 5));
      return result("Srautas", `${fmt(flow, 2)} m³/h`, flow, [
        ["Litrais per minutę", `${fmt((flow * 1000) / 60, 1)} l/min`],
      ], "Srautas = galia / (c · ΔT). c = 1,163 kWh/(m³·K).");
    }
    case "vamzdzio-dydis": {
      let flow = num(values.flow, 1.03);
      if (values.input === "power") flow = flowM3hFromKw(num(values.power, 8), num(values.delta, 5));
      if (values.input === "ls") flow = num(values.flowLs, 0.29) * 3.6;
      const catalog = values.material === "multilayer"
        ? [["16 mm", 12], ...MAIN_PIPES.multilayer]
        : MAIN_PIPES[values.material] || MAIN_PIPES.multilayer;
      const forced = values.forced !== "auto" && catalog.find((pipe) => pipe[0] === values.forced);
      const pipe = forced
        ? { sizeLabel: forced[0], innerMm: forced[1], velocity: velocityMps(flow, forced[1]) }
        : pickPipe(flow, catalog);
      return result("Vamzdžio dydis", pipe.sizeLabel, pipe.innerMm, [
        ["Srautas", `${fmt(flow, 2)} m³/h`],
        ["Greitis", `${fmt(pipe.velocity, 2)} m/s`],
        ["Vidus", `${fmt(pipe.innerMm, 1)} mm`],
      ], pipe.velocity > MAX_VELOCITY ? "Greitis viršija 1,25 m/s — reikia storesnio vamzdžio." : "Imamas mažiausias vamzdis, kurio greitis neviršija 1,25 m/s.");
    }
    case "vamzdzio-nuostoliai": {
      const area = clampArea(values.area);
      let length = Math.round(num(values.length, 5));
      if (length < 1 || length > 10) length = 5;
      const loops = sizeFloorLoops(area, 16);
      const flow = Math.round(loops.loops * loops.flowM3h * 100) / 100;
      const main = pickPipe(flow, MAIN_PIPES[values.material] || MAIN_PIPES.multilayer);
      const material = ROUGHNESS_M[values.material] ? values.material : "multilayer";
      const mainKpa = Math.round((frictionKpa(length, flow, main.innerMm, material) * 2 + localKpa(LOCAL_K, flow, main.innerMm)) * 10) / 10;
      const sourceDrop = values.hex === "none" ? DEFAULT_HP_DROP_KPA : PLATE_HEX_DROP_KPA;
      const pumpKpa = Math.round((loops.pressureKpa + mainKpa + PUMP_FITTINGS_KPA + sourceDrop) * 10) / 10;
      const head = Math.round((pumpKpa * 1000 / (WATER_DENSITY * G)) * 100) / 100;
      const hydraulic = Math.round(((flow / 3600) * pumpKpa * 1000) * 10) / 10;
      const electrical = Math.round((hydraulic / Math.max(0.15, PUMP_EFFICIENCY)) * 10) / 10;
      const collectors = Math.max(1, Math.ceil(loops.loops / BRANCHES_PER_COLLECTOR));
      const word = plural(loops.loops, "šaka", "šakos", "šakų");
      const label = `Cirkuliacinis ~${fmt(head, 1)} m, ${fmt(flow, 2)} m³/h, ${Math.ceil(electrical / 5) * 5} W`;
      return result("Kontūrai", `${loops.loops} ${word}`, loops.loops, [
        ["Kolektorius", collectors === 1 ? `${loops.loops} ${word}` : `${collectors} vnt. · ${loops.loops} ${word}`],
        ["Magistralė", main.sizeLabel],
        ["Srautas", `${fmt(flow, 2)} m³/h`],
        ["Siurblio slėgis", `${fmt(head, 2)} m`],
        ["Rekomenduojamas siurblys", label],
      ], `Siurblys: kontūras ${fmt(loops.pressureKpa, 1)} kPa + ${fmt(length, 0)} m tiekimas ir grįžimas + ${values.hex === "none" ? "šaltinis" : "HEX"}.`);
    }
    case "grindiniai-konturai": {
      const area = num(values.area, 108);
      const pipe = num(values.pipeMm, 16);
      const sized = sizeFloorLoops(area, pipe);
      const other = sizeFloorLoops(area, pipe === 16 ? 18 : 16);
      return result("Kontūrų skaičius", String(sized.loops), sized.loops, [
        ["Vieno kontūro plotas", `${fmt(sized.loopAreaM2, 1)} m²`],
        ["Vieno kontūro vamzdis", `${sized.loopPipeM} m`],
        ["Iš viso vamzdžio", `${sized.totalPipeM} m`],
        ["Ilgio riba", `${sized.maxLengthM} m`],
        ["EN 1264 riba", `${sized.maxEnLengthM} m`],
        ["Kontūro nuostolis", `${fmt(sized.pressureKpa, 1)} kPa`],
        [`${other.pipeMm} mm palyginimas`, `${other.loops} kontūr.`],
      ], "6,7 m/m² prie 150 mm žingsnio. Ilgio riba iš 25 kPa (Uponor, su 2×5 m prijungimu). 18 mm leidžia ilgesnį kontūrą.");
    }
    case "isspletimo-indas": {
      const volume = heatingVolume(values);
      const floor = values.heating !== "radiators";
      const vessel = expansionVessel({
        systemL: volume.totalL,
        fillC: 15,
        maxC: floor ? 40 : 70,
        p0Bar: 1,
        safetyValveBar: 3,
        kind: "heating",
      });
      const rows = [
        ["Sistemos vanduo", `${fmt(volume.totalL, 1)} l`],
        ["Išsiplėtimas", `${fmt(vessel.percent, 2)} %`],
        ["pe / p0", `${fmt(vessel.peBar, 1)} / ${fmt(vessel.p0Bar, 1)} bar`],
        ["Indas", `${vessel.sizeL} l`],
      ];
      if (values.source === "gas_boiler") {
        rows.push(["Katilo indas", "8 l"]);
        if (vessel.sizeL > 8) rows.push(["Papildomas", "integruoto 8 l neužtenka"]);
      }
      return result("Išsiplėtimo indas", `${vessel.sizeL} l`, vessel.sizeL, rows, volume.note || "EN 12828: Ve iš Kell tankio (pripildymas 15 °C), atsarga 0,5 % arba 3 l, indams ≤15 l — 20 %.");
    }
    case "boilerio-isspletimo-indas": {
      const litres = num(values.litres, 200);
      const vessel = expansionVessel({ systemL: litres, fillC: 15, maxC: 60, p0Bar: 3.5, safetyValveBar: 6, kind: "dhw" });
      return result("Boilerio indas", `${vessel.sizeL} l`, vessel.sizeL, [
        ["Talpa", `${litres} l`],
        ["8 % patikra", `${fmt(litres * 0.08, 1)} l`],
        ["Išsiplėtimas", `${fmt(vessel.percent, 2)} %`],
        ["Skaičiuotinas tūris", `${fmt(vessel.exactL, 1)} l`],
      ], "Karštas vanduo atskiras nuo šildymo. Pripildymas 15 °C, maksimumas 60 °C, vožtuvas 6 bar, p0 3,5 bar.");
    }
    case "skyscio-kiekis": {
      const floorInner = num(values.floorMm, 16) === 18 ? 14 : 12;
      const floorL = pipeWaterLitres(floorInner, num(values.floorM, 0));
      const mainInner = DN_INNER[num(values.mainDn, 0)] || 0;
      const mainL = values.mainDn === "0" ? 0 : pipeWaterLitres(mainInner, num(values.mainM, 0));
      const hpL = Math.max(0, num(values.hpL, 0));
      const bufferL = Math.max(0, num(values.bufferL, 0));
      const extraL = Math.max(0, num(values.extraL, 0));
      const total = floorL + mainL + hpL + bufferL + extraL;
      const mono = values.layout !== "split";
      const share = mono ? (GLYCOL_SHARE[String(values.freeze)] ?? 0.33) : 0;
      const glycol = total * share;
      const vessel = expansionVessel({
        systemL: total,
        fillC: 15,
        maxC: 40,
        p0Bar: 1,
        safetyValveBar: 3,
        kind: "heating",
      });
      const rows = [
        ["Grindų vamzdžiai", `${fmt(round1(floorL), 1)} l · ${fmt(num(values.floorM, 0), 0)} m`],
        ["Magistralė", `${fmt(round1(mainL), 1)} l`],
        ["Siurblys", `${fmt(round1(hpL), 1)} l`],
        ["Akumuliacinė talpa", `${fmt(round1(bufferL), 1)} l`],
        ["Kolektoriai ir kita", `${fmt(round1(extraL), 1)} l`],
        ["Iš viso", `${fmt(round1(total), 1)} l`],
        ["Glikolis", mono ? `${fmt(round1(glycol), 1)} l · ${Math.round(share * 100)} %` : "0 l"],
        ["Vanduo mišinyje", `${fmt(round1(total - glycol), 1)} l`],
        ["Išsiplėtimo indas", `${vessel.sizeL} l`],
      ];
      const note = mono
        ? "16 mm vamzdžio vidus 12 mm, 18 mm — 14 mm. Glikolio dalis apytikslė monopropilenglikoliui, kad mišinys neužšaltų iki pasirinktos temperatūros. Monobloko lauko kontūrą juo ir reikia užpildyti. Indo dydis — tas pats vandens skaičius kaip „Išsiplėtimo indas“: pripildymas 15 °C, maksimumas 40 °C."
        : "Split sistemoje šildymo vanduo lieka patalpoje, todėl glikolio paprastai nereikia. Skaičius rodo išsiplėtimo indą tam tūriui. Indo metodas tas pats kaip „Išsiplėtimo indas“: pripildymas 15 °C, maksimumas 40 °C.";
      return result(
        mono ? "Glikolio reikia" : "Išsiplėtimo indas",
        mono ? `${fmt(round1(glycol), 1)} l glikolio` : `${vessel.sizeL} l indas`,
        mono ? glycol : vessel.sizeL,
        rows,
        note,
      );
    }
    case "boilerio-talpa": {
      const tank = pickTank(num(values.occupants, 4), values.source === "gas_boiler" ? "gas_boiler" : "heat_pump");
      return result("Talpa", `${tank.litres} l`, tank.litres, [
        ["Gyvatukas", `${fmt(tank.coilM2, 1)} m²`],
        ["Pagal 50 l/žm.", `${fmt(tank.occupancyL, 0)} l`],
      ], tank.warnings[0] || (values.source === "gas_boiler" ? "Katilui gyvatukas ≥1,0 m². 50 l/žm. čia per daug." : "Šilumos siurbliui gyvatukas ≥2,0 m²."));
    }
    case "duju-suvartojimas": {
      const season = seasonalDemand({
        areaM2: num(values.area, 120),
        energyClass: values.energyClass,
        occupants: num(values.occupants, 4),
        classKw: num(values.classKw, 24),
      });
      const dn = num(values.classKw, 24) <= 20 ? 20 : num(values.classKw, 24) <= 35 ? 25 : 32;
      return result("Dujos per metus", `${season.gasM3Year} m³`, season.gasM3Year, [
        ["Per dieną", `${fmt(season.gasM3Day, 2)} m³`],
        ["Per savaitę", `${fmt(season.gasM3Week, 1)} m³`],
        ["Per mėnesį", `${fmt(season.gasM3Month, 1)} m³`],
        ["Šildymas", `${season.heatKwhYear} kWh`],
        ["Karštas vanduo", `${season.dhwKwhYear} kWh`],
        ["Pilna galia", `${fmt(season.peakM3h, 2)} m³/h`],
        ["Įvado dydis", `DN${dn}`],
      ], "Metinės dujos — klasė × plotas ir 40 l/žm., dalinta iš 9,5 kWh/m³ × 0,95. Pilna galia yra vamzdžiui, ne sąskaitai. Įvadas — lentelė, ne slėgio kritimas.");
    }
    case "sildymo-kaina": {
      const season = seasonalDemand({
        areaM2: num(values.area, 120),
        energyClass: values.energyClass,
        occupants: num(values.occupants, 4),
        indoorC: num(values.indoor, 20),
        classKw: 12,
      });
      const gasPrice = num(values.gasPrice, 1);
      const electric = num(values.electricPrice, 0.2);
      const floorCop = num(values.scopFloor, 2.3);
      const radCop = num(values.scopRad, 2);
      const total = season.heatRaw + season.dhwRaw;
      const lpgKg = num(values.lpgKg, LPG.cylinderKg);
      const lpgPrice = num(values.lpgPrice, LPG.priceEur);
      const lpg = lpgBill(total, lpgKg, lpgPrice);
      const rows = [
        { id: "gas", name: "Dujos", quantity: `${season.gasM3Year} m³`, eur: (total / (GAS_KWH * GAS_EFFICIENCY)) * gasPrice },
        { id: "lpg", name: `SND ${lpgKg} kg`, quantity: `${Math.round(lpg.kg)} kg · ${lpg.cylindersToBuy} bal.`, eur: lpg.eur },
        {
          id: "floor",
          name: "Elektros kaina, šilumos siurblys (grindinis šildymas)",
          hint: Math.abs(floorCop - 2.3) < 0.051
            ? "Rekomenduojamas COP 2,3"
            : `Skaičiuojama su COP ${fmt(floorCop, 1)}. Rekomenduojamas COP 2,3`,
          quantity: `${Math.round(total / floorCop)} kWh`,
          eur: (total / floorCop) * electric,
        },
        {
          id: "rad",
          name: "Elektros kaina, šilumos siurblys (radiatoriai)",
          hint: Math.abs(radCop - 2) < 0.051
            ? "Rekomenduojamas COP 2,0"
            : `Skaičiuojama su COP ${fmt(radCop, 1)}. Rekomenduojamas COP 2,0`,
          quantity: `${Math.round(total / radCop)} kWh`,
          eur: (total / radCop) * electric,
        },
        { id: "electric", name: "Elektra", hint: "Tiesioginė elektra, be šilumos siurblio", quantity: `${Math.round(total)} kWh`, eur: total * electric },
      ];
      const warned = lpgKg !== LPG.cylinderKg && Math.abs(lpgPrice - LPG.priceEur) < 0.001;
      const method = warned
        ? `Įrašyta ${fmt(LPG.priceEur, 2)} € yra ${LPG.cylinderKg} kg baliono kaina. Pasirinktam balionui įrašykite jo kainą. Kitų dydžių kainų čia nėra.`
        : "Šildymas — klasė × plotas, prie kitokios temperatūros dauginama iš Vilniaus dienolaipsnių. Karštas vanduo — 40 l ir 51 kWh/m³. SND — 12,8 kWh/kg ir naudingumas 0,95. Baliono depozitas ir pristatymas neįskaičiuoti.";
      return {
        headlineLabel: "Pigiausia per metus",
        headline: `${Math.round(Math.min(...rows.map((row) => row.eur)))} €`,
        numeric: Math.min(...rows.map((row) => row.eur)),
        rows: rows.map((row) => [row.name, `${Math.round(row.eur)} € · ${row.quantity}`]),
        bills: rows,
        heat: season.heatRaw,
        dhw: season.dhwRaw,
        link: { href: LPG.url, label: `${LPG.shop}: ${LPG.product}` },
        note: `Vidutinė Lietuvos žiema yra apie −3…−5 °C, priklausomai nuo vietovės. Prie tokios lauko temperatūros rekomenduojamas šilumos siurblio COP yra 2,3 grindiniam šildymui ir 2,0 radiatoriams. Kataloginio SCOP 4 imti nereikia: tai švelnių sąlygų maksimumas. ${method}`,
      };
    }
    case "suskystintos-dujos": {
      const season = seasonalDemand({
        areaM2: num(values.area, 120),
        energyClass: values.energyClass,
        occupants: num(values.occupants, 4),
        indoorC: num(values.indoor, 20),
        classKw: 12,
      });
      const total = season.heatRaw + season.dhwRaw;
      const lpgKg = num(values.lpgKg, LPG.cylinderKg);
      const lpgPrice = num(values.lpgPrice, LPG.priceEur);
      const lpg = lpgBill(total, lpgKg, lpgPrice);
      const warned = lpgKg !== LPG.cylinderKg && Math.abs(lpgPrice - LPG.priceEur) < 0.001;
      return {
        headlineLabel: "Per metus",
        headline: `${Math.round(lpg.eur)} €`,
        numeric: lpg.eur,
        rows: [
          ["Šildymas", `${season.heatKwhYear} kWh`],
          ["Karštas vanduo", `${season.dhwKwhYear} kWh`],
          ["Propanas", `${fmt(lpg.kg, 0)} kg`],
          ["Balionų pagal energiją", fmt(lpg.cylinders, 2)],
          ["Pirkti balionų", `${lpg.cylindersToBuy} vnt.`],
          ["Jei perkate sveikus", `${Math.round(lpg.purchaseEur)} €`],
          ["Baliono kaina", `${fmt(lpgPrice, 2)} € / ${lpgKg} kg`],
        ],
        link: { href: LPG.url, label: `${LPG.shop}: ${LPG.product}, ${fmt(LPG.priceEur, 2)} €` },
        note: warned
          ? `Įrašyta ${fmt(LPG.priceEur, 2)} € yra tik ${LPG.cylinderKg} kg PropanGAS kaina. ${lpgKg} kg baliono kainos neperrašome — įrašykite ją patys.`
          : `Grynas propanas, ${fmt(LPG.kwhPerKg, 1)} kWh/kg, katilo naudingumas 0,95. ${fmt(LPG.priceEur, 2)} € — ${LPG.cylinderKg} kg dujos su PVM, patikrinta ${LPG.checkedOn}. Depozitas ${LPG.depositEur} € ir pristatymas neįskaičiuoti. 19, 21 ir 33 kg kainų nėra.`,
      };
    }
    case "momentinis-kv": {
      const people = num(values.occupants, 4);
      const lpm = people <= 2 ? 10 : people <= 4 ? 12 : 14;
      const delta = num(values.delta, 35);
      const kw = Math.round((((lpm * 60) / 1000) * Math.max(1, delta) * WATER_KWH) * 10) / 10;
      return result("Reikalinga galia", `${fmt(kw, 1)} kW`, kw, [
        ["Srautas", `${lpm} l/min`],
        ["Per valandą", `${fmt((lpm * 60) / 1000, 2)} m³/h`],
        ["Pakėlimas", `+${delta} K`],
      ], `Numatytas pakėlimas +${delta} K. Tai momentinė galia, kol čiaupas atidarytas.`);
    }
    case "freono-trasa": {
      const kw = num(values.classKw, 8);
      const row = FREON.find((item) => kw <= item.maxKw) || FREON[FREON.length - 1];
      return result("Dujinė linija", `Ø ${fmt(row.gasMm, 2)} mm`, row.gasMm, [
        ["Dujinė linija", `${fmt(row.gasMm, 2)} mm (${row.gasInch})`],
        ["Skysčio linija", `${fmt(row.liquidMm, 2)} mm (${row.liquidInch})`],
      ], "Tipinė R32 lentelė, ne skaičiavimas. Trasos ribą ir papildomą freoną ima konkretaus modelio instrukcija.");
    }
    case "radiatoriai-en442": {
      const supply = num(values.regime, 40);
      const back = regimeReturn(supply);
      const duty = num(values.duty, 1.5);
      const ratio = en442OutputRatio(supply, back);
      const catalog = ratio > 0 ? duty / ratio : 0;
      const low = en442OutputRatio(40, 33);
      const catalog40 = low > 0 ? duty / low : 0;
      const mixing = supply > 40;
      return result("Katalogo galia 75/65/20", `${fmt(catalog, 2)} kW`, catalog, [
        ["Režimas", `${supply}/${back} °C`],
        ["Q/Q50", fmt(ratio, 2)],
        ["40 °C katalogas", `${fmt(catalog40, 2)} kW`],
        ["Maišymo mazgas", mixing ? "taip" : "ne"],
      ], mixing
        ? `Prie ${supply} °C grindims reikia maišymo mazgo. Padidinus radiatorius iki ${fmt(catalog40, 2)} kW katalogo visą sistemą galima leisti 40 °C.`
        : "Tiekimas neviršija 40 °C, maišymo mazgo grindims nereikia.");
    }
    case "dujotiekio-vamzdis": {
      const sized = sizeGasPipe({
        powerKw: num(values.power, 15),
        lengthM: num(values.length, 12),
        fittings: num(values.fittings, 4),
        appliances: num(values.appliances, 1),
      });
      const rows = [
        ["Dujų slėgis", "21 mbar"],
        ["Dujų srautas", `${fmt(sized.flow, 2)} m³/h`],
        ["Ekviv. ilgis", `${fmt(sized.equivalent, 1)} m`],
        ["Slėgio kritimas", `${Math.round(sized.chosen.dropPa)} Pa`],
        ["Leistina ΔP", "300 Pa (3 mbar)"],
        ["Tinka visas ilgis", sized.withinLimit ? "taip" : "ne"],
      ];
      sized.firstOfKind.forEach((pipe) => {
        rows.push([`Arba ${GAS_KIND_NAME[pipe.kind]}`, `${pipe.sizeLabel} · ${Math.round(pipe.dropPa)} Pa`]);
      });
      return result(
        "Vamzdis",
        `${GAS_KIND_NAME[sized.chosen.kind]} ${sized.chosen.sizeLabel}`,
        sized.chosen.innerMm,
        rows,
        sized.withinLimit ? "Imamas pirmas tinkamas kiekvienos rūšies vamzdis. Šiurkštumas 0,045 mm, kaip programėlėje." : "Nė vienas vamzdis netelpa į 300 Pa ir 6 m/s — reikia trumpesnės trasos arba storesnio vamzdžio."
      );
    }
    case "dujotiekio-irengimas": {
      const place = values.place === "wall" ? "wall" : "boundary";
      const price = GAS_CONNECTION[place];
      return result("Įvado kaina", `${price.low}–${price.high} €`, price.low, [
        ["Vieta", price.label],
        ["Neįtraukta", "be ESO, signalizacijos ir katilo montavimo"],
      ], "Rimanto 2026-09-13 rėžiai. Tai ne sąmata konkrečiam objektui.");
    }
    default:
      return result("Skaičiuoklė", "–", null, [], "");
  }
}
