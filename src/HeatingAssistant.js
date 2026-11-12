import React, { useMemo, useState } from "react";
import devicesRaw from "./devices.json";
import priceBook from "./priceQuotes.json";
import { addDays, withPublicPrices } from "./publicPrices";
import Calculators from "./CalculatorPanel";

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function presentPrice(device) {
  if (!device.price_verified || !device.vendors?.length) {
    return {
      ...device,
      price_eur: null,
      price_average_eur: null,
      price_shop: null,
      price_url: null,
      price_source: "Vieša kaina nerasta.",
    };
  }
  const shop = device.vendors[0];
  const staleFrom = addDays(device.price_valid_until, 1);
  const validity = device.price_current
    ? `Galioja iki ${device.price_valid_until}`
    : `Pasenusi nuo ${staleFrom}`;
  const average = device.price_offer_count > 1
    ? ` Vidurkis ${device.price_average_eur} € iš ${device.price_offer_count}.`
    : "";
  return {
    ...device,
    price_shop: shop.name,
    price_url: shop.url,
    price_stale_from: staleFrom,
    price_source: `Mažiausia ${device.price_eur} €.${average} ${validity}. Tik įranga, su PVM, be montavimo.`,
  };
}

const PREMIUM_MIN_BUDGET = 4000;
const COMPANY_EMAIL = "info@sildymopasirinkimas.lt";

/** === PAGALBINĖS FUNKCIJOS === */
function estimateRequiredKw(area, insulation) {
  const A = Number(area);
  if (!Number.isFinite(A) || A <= 0) return 0;
  const coef = {
    "Labai gera (A+/A)": 0.045,
    "Vidutinė (B/C)": 0.06,
    "Silpna (D ir senesni)": 0.085,
  }[insulation] ?? 0.06;
  return Math.max(5, Math.round(A * coef));
}
function eur(v) {
  if (v == null) return "-";
  try {
    return new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
  } catch { return v + " €"; }
}
const asArray = (x) => (Array.isArray(x) ? x : []);
function normalizeDevices(data) {
  if (Array.isArray(data)) return data;
  const prem = asArray(data.premium).map(d => ({ ...d, tier: d.tier || "premium" }));
  const budg = asArray(data.budget).map(d => ({ ...d, tier: d.tier || "budget" }));
  return [...prem, ...budg];
}

/** === KOMPONENTAS === */
export default function HeatingAssistant() {
  const devices = useMemo(
    () => withPublicPrices(normalizeDevices(devicesRaw), priceBook, todayIso()).map(presentPrice),
    []
  );
  const [inputs, setInputs] = useState({
    buildingType: "Namas",
    area: "",
    insulation: "",
    gasAvailable: "Ne",     // "Taip" | "Ne"
    gasLineNearby: false,
    ownPowerPlant: false,
    solarPanels: false,
    dhwType: "",            // "Integruotas boileris" | "Atskiras boileris" | "Nereikia"
    budget: "",
    email: "",
  });
  const [sortBy, setSortBy] = useState("best"); // best | price_asc | price_desc | power_asc | power_desc
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [showBetterOffer, setShowBetterOffer] = useState(false);
  const [ignoreStrictFilters, setIgnoreStrictFilters] = useState(false); // diagnostikai
  const [showDevices, setShowDevices] = useState(false);
  const [fuelFilter, setFuelFilter] = useState("all");

  const showGasNearby = inputs.gasAvailable === "Ne";
  const budgetNum = useMemo(() => {
    const n = parseInt(String(inputs.budget).replace(/[^\d]/g, ""), 10);
    return Number.isFinite(n) ? n : undefined;
  }, [inputs.budget]);
  const requiredKw = useMemo(
    () => estimateRequiredKw(inputs.area, inputs.insulation),
    [inputs.area, inputs.insulation]
  );

  /** — Filtravimas — */
  const filteredAll = useMemo(() => {
    let list = [...devices];

    // 1) Kuras / dujos
    list = list.filter((d) => {
      if (d.fuel === "gas") {
        if (inputs.gasAvailable === "Taip") return true;
        if (inputs.gasAvailable === "Ne" && inputs.gasLineNearby) return true;
        return false;
      }
      return true;
    });

    // 2) Saulės suderinamumas (tik jei pažymėta)
    if (inputs.solarPanels) {
      list = list.filter((d) => d.solar_compatible !== false);
    }

    // 3) DHW: nebeatmetam – tik dedam pastabą
    if (inputs.dhwType) {
      list = list.map((d) => {
        let dhwNote = "";
        if (inputs.dhwType === "Integruotas boileris" && d.dhw !== "integruotas" && d.dhw !== "momentinis") {
          dhwNote = "Reikės atskiro boilerio";
        }
        if (inputs.dhwType === "Integruotas boileris" && d.dhw === "momentinis") {
          dhwNote = "Karštas vanduo ruošiamas momentiniu būdu";
        }
        if (inputs.dhwType === "Nereikia" && d.dhw !== "none") {
          dhwNote = "Boilerį galima nenaudoti / atjungti";
        }
        return { ...d, _dhwNote: dhwNote };
      });
    }

    // 4) Galia (lankstesnė; dujiniams leidžiam didesnį oversize)
    const need = requiredKw || 0;
    if (!ignoreStrictFilters) {
      list = list.filter((d) => {
        if (!need) return true;
        const single = d.power_kw ?? null;
        let pmin = d.power_kw_min ?? null;
        let pmax = d.power_kw_max ?? null;

        if (single != null) { // turim vieną skaičių
          pmax = single;
          pmin = single * 0.2; // moduliacijos prielaida
        }

        if (d.fuel === "gas") {
          const assumedMin = Math.max(3, Math.round((pmin ?? 0) || (pmax ? pmax * 0.2 : 3)));
          const high = pmax ?? 0;
          return assumedMin <= need * 1.2 && high >= need * 0.7;
        }

        const low = pmin ?? (pmax ?? 0);
        const high = pmax ?? (pmin ?? 0);
        if (!low && !high) return true;

        if (low === high) {
          return low >= need * 0.7 && low <= need * 1.7;
        }
        return need >= (low * 0.6) && need <= (high * 1.4);
      });
    }

    // 5) Biudžetas (nebent ignoruojam)
    if (!ignoreStrictFilters && budgetNum) {
      list = list.filter((d) => (d.price_eur ?? Infinity) <= budgetNum);
    }

    // 6) Score/rūšiavimas
    list = list.map((d) => {
      const ref = d.power_kw ?? d.power_kw_min ?? need;
      const score = Math.abs((ref || need) - need) + (d.price_eur || 999999) / 100000;
      return { ...d, _score: score };
    });
    switch (sortBy) {
      case "price_asc":  list.sort((a, b) => (a.price_eur || 9e9) - (b.price_eur || 9e9)); break;
      case "price_desc": list.sort((a, b) => (b.price_eur || -1) - (a.price_eur || -1)); break;
      case "power_asc":  list.sort((a, b) =>
        (a.power_kw ?? a.power_kw_min ?? 0) - (b.power_kw ?? b.power_kw_min ?? 0)); break;
      case "power_desc": list.sort((a, b) =>
        (b.power_kw ?? b.power_kw_min ?? 0) - (a.power_kw ?? a.power_kw_min ?? 0)); break;
      default:            list.sort((a, b) => a._score - b._score);
    }
    return list;
  }, [
    devices, inputs.gasAvailable, inputs.gasLineNearby, inputs.solarPanels,
    inputs.dhwType, requiredKw, budgetNum, sortBy, ignoreStrictFilters
  ]);

  // Tiers
  const premiumList = useMemo(() => filteredAll.filter(d => (d.tier || "").toLowerCase() === "premium"), [filteredAll]);
  const budgetList  = useMemo(() => filteredAll.filter(d => (d.tier || "").toLowerCase() === "budget"),  [filteredAll]);
  const hasTiers    = premiumList.length + budgetList.length > 0 && premiumList.length !== filteredAll.length;
  const commonList  = useMemo(() => (!hasTiers ? filteredAll : []), [hasTiers, filteredAll]);

  /** — ĮVESTYS — */
  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setInputs((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  /** — Laiškai — */
  const emailSubject = (prefix) => `${prefix} – Šildymo įrenginių pasiūlymo užklausa`;
  const devicesToLines = (list) => {
    if (!list.length) return ["(šiuo metu filtras negrąžino variantų)"];
    return list.slice(0, 10).map((d, i) => {
      const power = d.power_kw != null ? `${d.power_kw} kW` : `${d.power_kw_min ?? "?"}–${d.power_kw_max ?? "?"} kW`;
      const extras = [];
      if (d.scop) extras.push(`SCOP ${d.scop}`);
      if (d.cop) extras.push(`COP ${d.cop}`);
      if (d.min_temp != null) extras.push(`iki ${d.min_temp} °C`);
      if (d.refrigerant) extras.push(d.refrigerant);
      const extraTxt = extras.length ? ` | ${extras.join(" · ")}` : "";
      return `${i + 1}) ${d.brand} ${d.model} (${d.type}) – ${power}, kaina: ${eur(d.price_eur)}${extraTxt}${d._dhwNote ? " | " + d._dhwNote : ""}`;
    });
  };
  const objectSummaryLines = () => [
    "Objekto duomenys:",
    `- Pastato tipas: ${inputs.buildingType}`,
    `- Plotas: ${inputs.area || "?"} m²`,
    `- Izoliacija: ${inputs.insulation || "?"}`,
    `- Dujos: ${inputs.gasAvailable}${inputs.gasAvailable === "Ne" ? `, trasa šalia: ${inputs.gasLineNearby ? "Taip" : "Ne"}` : ""}`,
    `- PV/elektrinė: ${inputs.solarPanels ? "Yra PV" : "Nėra"}${inputs.ownPowerPlant ? ", yra nuosava elektrinė" : ""}`,
    `- Karšto vandens ruošimas: ${inputs.dhwType || "Nenurodyta"}`,
    `- Biudžetas: ${inputs.budget || "Nenurodytas"}`,
    inputs.email ? `- Kliento el. paštas: ${inputs.email}` : "",
  ].filter(Boolean);
  const openMailTo = (to, subject, bodyLines) => {
    const href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
    window.location.href = href;
  };

  function handleGetQuote() {
    const top = filteredAll.slice(0, 3);
    const body = ["Sveiki,", "", "Prašau pateikti pasiūlymą šiems įrenginiams:", ...devicesToLines(top), "", ...objectSummaryLines(), "", "Ačiū!"];
    openMailTo(COMPANY_EMAIL, emailSubject("Užklausa"), body);
  }
  function handleBetterOffer(withInstallation) {
    if (!inputs.email) {
      alert("Įrašykite savo el. paštą, kad galėtume su jumis susisiekti.");
      return;
    }
    const usePremiumFirst = hasTiers && (budgetNum ? budgetNum >= PREMIUM_MIN_BUDGET : true);
    const blocks = [];
    if (hasTiers) {
      if (usePremiumFirst) {
        if (premiumList.length) blocks.push("REKOMENDUOJAMI (Premium):", ...devicesToLines(premiumList));
        if (budgetList.length) blocks.push("", "GALIMI PIGESNI (Budget):", ...devicesToLines(budgetList));
      } else {
        if (budgetList.length) blocks.push("GALIMI PIGESNI (Budget):", ...devicesToLines(budgetList));
        if (premiumList.length) blocks.push("", "REKOMENDUOJAMI (Premium):", ...devicesToLines(premiumList));
      }
    } else {
      blocks.push(...devicesToLines(filteredAll));
    }
    const subject = emailSubject(withInstallation ? "Prašau geresnio pasiūlymo SU montavimu" : "Prašau geresnio pasiūlymo BE montavimo");
    const body = [
      "Sveiki,",
      "",
      withInstallation
        ? "Noriu geresnio pasiūlymo SU montavimu. Žemiau – automatiškai atrinkti įrenginiai:"
        : "Noriu geresnio pasiūlymo BE montavimo. Žemiau – automatiškai atrinkti įrenginiai:",
      "",
      ...blocks,
      "",
      ...objectSummaryLines(),
      "",
      "Ačiū!",
    ];
    openMailTo(COMPANY_EMAIL, subject, body);
    setShowBetterOffer(false);
  }

  /** — Užklausa mums — */
  function handleChatSend() {
    const q = chatInput.trim();
    if (!q) return;
    if (!inputs.email) {
      alert("Įrašykite savo el. paštą viršuje, kad galėtume atsakyti.");
      return;
    }
    const body = [
      "Sveiki,",
      "",
      "Klausimas:",
      q,
      "",
      ...objectSummaryLines(),
      "",
      "Prašau atsakyti, ką siūlote.",
      "",
      "Ačiū!",
    ];
    openMailTo(COMPANY_EMAIL, "Klausimas apie katilą – Šildymo pasirinkimas", body);
    setChatMessages((p) => [...p, {
      sender: "Užklausa",
      text: `Laiškas paruoštas adresu ${COMPANY_EMAIL}. Klausimas paliktas laukelyje, jei pašto programa neatsidarė.`,
    }]);
  }

  /** — UI — */
  const byFuel = (list) => (fuelFilter === "all" ? list : list.filter((item) => item.fuel === fuelFilter));
  const fuels = [
    ["all", "Visi"],
    ["heatpump", "Šilumos siurbliai"],
    ["gas", "Dujiniai katilai"],
    ["electric", "Elektriniai"],
    ["pellet", "Granuliniai"],
  ];

  function openFuel(next) {
    setFuelFilter(next);
    setShowDevices(true);
  }

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1c3d36]">
      <header className="bg-[#1c3d36] text-[#f6f3ee] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[#e7c3a8]">Šildymo pasirinkimas</p>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Skaičiuoklės ir šildymo įrenginiai</h1>
          </div>
          <a className="shrink-0 text-sm font-medium rounded-full bg-[#c46b2d] text-white px-4 py-2" href="./Hidraulika-1.0.0.apk" download>
            Hidraulika Android
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Calculators />
        <section className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a5a32]">Katalogas</p>
          <h2 className="text-2xl font-semibold mt-1">Parinkti šildymo įrenginį</h2>
          <p className="text-sm text-[#5c675f] mt-2 max-w-2xl">
            Sąrašas neatsidaro pats. Pasirinkite rūšį — tada matysite tik tuos katilus ir siurblius, kurie tinka namui.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            {fuels.filter(([id]) => id !== "all").map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => openFuel(id)}
                className={showDevices && fuelFilter === id
                  ? "rounded-2xl border border-[#1c3d36] bg-[#1c3d36] text-[#f6f3ee] p-4 text-left"
                  : "rounded-2xl border border-[#e4ddd2] bg-white p-4 text-left hover:border-[#c46b2d]"}
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6f3ee]">
                  <FuelMark id={id} />
                </span>
                <span className="block mt-3 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </section>
        {showDevices && (
        <>
        {/* FORMA */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#e4ddd2] p-4 md:p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Objekto parametrai</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Pastato tipas">
              <select name="buildingType" className="border rounded-lg w-full p-2" value={inputs.buildingType} onChange={handleInputChange}>
                <option>Namas</option><option>Butas</option><option>Kotedžas</option>
              </select>
            </Field>
            <Field label="Bendras plotas (m²)">
              <input name="area" className="border rounded-lg w-full p-2" type="number" placeholder="pvz., 150" value={inputs.area} onChange={handleInputChange}/>
            </Field>
            <Field label="Izoliacija">
              <select name="insulation" className="border rounded-lg w-full p-2" value={inputs.insulation} onChange={handleInputChange}>
                <option value="">— Pasirinkite —</option>
                <option>Labai gera (A+/A)</option>
                <option>Vidutinė (B/C)</option>
                <option>Silpna (D ir senesni)</option>
              </select>
              {inputs.area && inputs.insulation && (
                <p className="text-xs text-slate-500 mt-1">Apytikslis poreikis: <strong>{requiredKw} kW</strong></p>
              )}
            </Field>
            <Field label="Ar yra dujų įvadas?">
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="gasAvailable" value="Taip" checked={inputs.gasAvailable === "Taip"} onChange={handleInputChange}/> Taip
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="gasAvailable" value="Ne" checked={inputs.gasAvailable === "Ne"} onChange={handleInputChange}/> Ne
                </label>
              </div>
              {showGasNearby && (
                <label className="inline-flex items-center gap-2 mt-2">
                  <input type="checkbox" name="gasLineNearby" checked={inputs.gasLineNearby} onChange={handleInputChange}/> Ar yra dujų trasa šalia?
                </label>
              )}
            </Field>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="ownPowerPlant" checked={inputs.ownPowerPlant} onChange={handleInputChange}/> Yra nuosava elektrinė
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="solarPanels" checked={inputs.solarPanels} onChange={handleInputChange}/> Yra saulės baterijos
            </label>
            <Field label="Karšto vandens ruošimas">
              <select name="dhwType" className="border rounded-lg w-full p-2" value={inputs.dhwType} onChange={handleInputChange}>
                <option value="">— Pasirinkite —</option>
                <option>Integruotas boileris</option>
                <option>Atskiras boileris</option>
                <option>Nereikia</option>
              </select>
            </Field>
            <Field label="Biudžetas (€)">
              <input name="budget" className="border rounded-lg w-full p-2" type="number" placeholder="pvz., 5000" value={inputs.budget} onChange={handleInputChange}/>
            </Field>
            <Field label="Jūsų el. paštas (kontaktui)">
              <input name="email" className="border rounded-lg w-full p-2" type="email" placeholder="vardas@pastas.lt" value={inputs.email} onChange={handleInputChange}/>
            </Field>
          </div>
        </section>

        {/* VALDIKLIAI + LENTELĖS */}
        <section className="bg-white rounded-3xl shadow-sm border border-[#e4ddd2] p-4 md:p-6 mb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-medium">Siūlomi įrenginiai</h2>
            <button type="button" className="text-sm underline text-[#8a5a32]" onClick={() => setShowDevices(false)}>Slėpti sąrašą</button>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">Rūšiuoti pagal:</label>
              <select className="border rounded-lg p-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="best">Geriausias atitikimas</option>
                <option value="price_asc">Kaina ↑</option>
                <option value="price_desc">Kaina ↓</option>
                <option value="power_asc">Galia ↑</option>
                <option value="power_desc">Galia ↓</option>
              </select>
              <label className="text-sm text-slate-600 inline-flex items-center gap-2">
                <input type="checkbox" checked={ignoreStrictFilters} onChange={(e) => setIgnoreStrictFilters(e.target.checked)}/>
                Rodyti visus (nepaisant galios/biudžeto)
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {fuels.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={fuelFilter === id}
                onClick={() => setFuelFilter(id)}
                className={fuelFilter === id
                  ? "px-3 py-1.5 rounded-full text-sm bg-[#c46b2d] text-white"
                  : "px-3 py-1.5 rounded-full text-sm border border-[#e4ddd2] bg-[#fbf8f3]"}
              >
                {label}
              </button>
            ))}
          </div>

          {fuelFilter === "gas" && inputs.gasAvailable !== "Taip" && !inputs.gasLineNearby && (
            <p className="text-sm text-[#8a5a32] mt-3">Dujiniai katilai atsiranda, kai pažymite, kad dujų įvadas yra arba trasa šalia.</p>
          )}

          {/* Bendras arba Premium/Budget išdėstymas */}
          {!hasTiers && <DeviceTable list={byFuel(commonList)} />}
          {hasTiers && (
            <>
              {(budgetNum ? budgetNum >= PREMIUM_MIN_BUDGET : true) && byFuel(premiumList).length > 0 && (
                <>
                  <h3 className="text-base font-medium mt-4 mb-2">Mūsų rekomenduojami (Premium)</h3>
                  <DeviceTable list={byFuel(premiumList)} />
                  {byFuel(budgetList).length > 0 && (
                    <>
                      <h3 className="text-base font-medium mt-6 mb-2">Galimi pigesni (Budget)</h3>
                      <DeviceTable list={byFuel(budgetList)} />
                    </>
                  )}
                </>
              )}
              {budgetNum && budgetNum < PREMIUM_MIN_BUDGET && (
                <>
                  <h3 className="text-base font-medium mt-4 mb-2">Galimi pigesni (Budget)</h3>
                  <DeviceTable list={byFuel(budgetList)} />
                  {byFuel(premiumList).length > 0 && (
                    <>
                      <h3 className="text-base font-medium mt-6 mb-2">Mūsų rekomenduojami (Premium)</h3>
                      <DeviceTable list={byFuel(premiumList)} />
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* Veiksmai */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button onClick={handleGetQuote} className="inline-flex items-center justify-center rounded-xl bg-[#1c3d36] hover:bg-[#142e29] text-white px-4 py-2 font-medium shadow">
              Gauti pasiūlymą
            </button>
            <button onClick={() => setShowBetterOffer(true)} className="inline-flex items-center justify-center rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 px-4 py-2 font-medium border border-amber-200">
              ⚠️ Neskubėkite pirkti! Galbūt mes galime pateikti jums geresnį pasiūlymą.
            </button>
          </div>

          <p className="text-sm text-slate-500 mt-3">
            Prioritetiniai: Alsavo, Protherm, Bosch ir Buderus. Juos rodome tarp rekomenduojamų.
            Kiti gamintojai lieka, kai tinka pagal galią ir biudžetą.
          </p>
        </section>
        </>
        )}

        <section className="bg-white rounded-3xl shadow-sm border border-[#e4ddd2] p-4 md:p-6">
          <h2 className="text-lg font-medium mb-2">Klauskite katilo kainos</h2>
          <p className="text-sm text-[#5c675f] mb-3">
            Parašykite modelį ar ko ieškote. Užklausa ateina mums į {COMPANY_EMAIL}, atsakome, ką siūlome.
          </p>
          <label className="block text-sm mb-3">
            Jūsų el. paštas
            <input name="email" className="border border-[#e4ddd2] rounded-lg w-full p-2 mt-1" type="email" placeholder="vardas@pastas.lt" value={inputs.email} onChange={handleInputChange}/>
          </label>
          {chatMessages.length > 0 && (
            <div className="mb-3 border rounded-lg p-3 bg-slate-50 text-sm text-slate-700">
              {chatMessages[chatMessages.length - 1].text}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-2">
            <textarea
              className="flex-1 border rounded-lg p-2 min-h-[5rem]"
              placeholder="Pvz. kiek kainuoja Bosch Condens 2300iW ir ar galite pasiūlyti su montavimu?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button onClick={handleChatSend} className="rounded-xl bg-[#c46b2d] hover:bg-[#a85622] text-white px-4 py-2 font-medium">
              Siųsti užklausą
            </button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-[#8a918c]">
        © {new Date().getFullYear()} Šildymo pasirinkimas · <a className="underline" href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
      </footer>

      {/* MODALAS: “Neskubėkite pirkti…” */}
      {showBetterOffer && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border p-6">
            <h3 className="text-lg font-semibold mb-2">Geresnio pasiūlymo galimybė</h3>
            <p className="text-slate-600">
              Mes esame profesionalai ir perkame didesnius kiekius, todėl galime pasiūlyti geresnes nuolaidas.
              Kai kuriuos įrenginius perkame tiesiai iš gamintojo. Taip pat galime pasiūlyti montavimo paslaugą.
            </p>
            <div className="mt-4 grid gap-2">
              <button onClick={() => handleBetterOffer(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-medium">
                Taip, noriu geresnio pasiūlymo su montavimu
              </button>
              <button onClick={() => handleBetterOffer(false)} className="rounded-xl bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 font-medium">
                Taip, noriu geresnio pasiūlymo be montavimo
              </button>
              <button onClick={() => setShowBetterOffer(false)} className="rounded-xl bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 font-medium border">
                Atšaukti
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-3">* Laiške bus pridėtas jūsų el. paštas ir šiuo metu automatiškai atrinkti įrenginiai.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** — Maži UI helperiai — */
function FuelMark({ id }) {
  const common = "h-8 w-8";
  if (id === "gas") {
    return (
      <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 23c0-5 7-7 7-13 3.5 3.5 7 5.5 7 11a7 7 0 1 1-14 2z" fill="#c46b2d" />
      </svg>
    );
  }
  if (id === "electric") {
    return (
      <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M18 3 8 18h7l-1 11 11-16h-8l1-10z" fill="#1c3d36" />
      </svg>
    );
  }
  if (id === "pellet") {
    return (
      <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="8" y="8" width="16" height="18" rx="2" fill="#8a5a32" />
        <circle cx="13" cy="15" r="1.4" fill="#f6f3ee" />
        <circle cx="18" cy="18" r="1.4" fill="#f6f3ee" />
        <circle cx="14" cy="22" r="1.4" fill="#f6f3ee" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="11" width="15" height="13" rx="2" fill="#1c3d36" />
      <rect x="19" y="14" width="10" height="7" rx="1.5" fill="#c46b2d" />
      <path d="M7 11V7h7v4" fill="none" stroke="#8a5a32" strokeWidth="1.6" />
      <circle cx="8.5" cy="17.5" r="1.7" fill="#f6f3ee" />
    </svg>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
function DeviceTable({ list }) {
  if (!list || list.length === 0) {
    return <div className="border rounded-xl p-4 text-center text-slate-400">Nėra tinkamų įrenginių pagal pasirinktus kriterijus.</div>;
  }
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-slate-100">
          <tr>
            <Th>Tipas</Th><Th>Modelis</Th><Th>Kuras</Th><Th center>Galia (kW)</Th><Th center>Kaina</Th><Th>Argumentai</Th><Th>Iš kur kaina</Th>
          </tr>
        </thead>
        <tbody>
          {list.map((d) => (
            <tr key={d.id} className="border-t">
              <Td>{d.type}</Td>
              <Td>
                {d.brand} {d.model}
                {d.tier && (
                  <span className="ml-2 inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border">
                    {d.tier}
                  </span>
                )}
              </Td>
              <Td>{d.fuel}</Td>
              <Td center>{d.power_kw != null ? d.power_kw : `${d.power_kw_min ?? "?"}–${d.power_kw_max ?? "?"}`}</Td>
              <Td center>
                {d.price_eur == null ? "—" : eur(d.price_eur)}
                {d.price_verified && d.price_offer_count > 1 ? (
                  <div className="text-[10px] text-slate-500">vidurkis {eur(d.price_average_eur)}</div>
                ) : null}
                <div className="text-[10px] text-slate-400">
                  {d.price_verified
                    ? (d.price_current ? `galioja iki ${d.price_valid_until}` : `pasenusi nuo ${d.price_stale_from}`)
                    : "vieša kaina nerasta"}
                </div>
                {d.price_eur != null ? <div className="text-[10px] text-slate-400">tik įranga</div> : null}
              </Td>
              <Td>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {d.scop && <li>SCOP {d.scop}</li>}
                  {d.cop && <li>COP {d.cop}</li>}
                  {d.min_temp != null && <li>Darbas iki {d.min_temp} °C</li>}
                  {d.refrigerant && <li>Šaltnešis {d.refrigerant}</li>}
                  {d._dhwNote && <li>{d._dhwNote}</li>}
                  {d.notes && <li>{d.notes}</li>}
                </ul>
              </Td>
              <Td>
                <span className="text-slate-600">{d.price_source}</span>
                {d.price_url ? (
                  <>
                    {" "}
                    <a href={d.price_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      {d.price_shop || "Parduotuvė"}
                    </a>
                  </>
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Th({ children, center }) {
  return <th className={`p-2 border-b text-left ${center ? "text-center" : ""}`}>{children}</th>;
}
function Td({ children, center }) {
  return <td className={`p-2 align-top ${center ? "text-center" : ""}`}>{children}</td>;
}
