import React, { useMemo, useState } from "react";
import {
  CALCULATORS,
  computeCalculator,
  defaultValues,
  pipeSizeOptions,
} from "./calculators";

const GROUPS = [
  {
    id: "suvartojimas",
    title: "Suvartojimas",
    hint: "Šiluma ir metinė kaina",
    ids: ["sildymo-kaina", "suskystintos-dujos", "duju-suvartojimas", "silumos-poreikis"],
  },
  {
    id: "sistema",
    title: "Šildymo sistema",
    hint: "Vamzdžiai, skystis, indai",
    ids: [
      "skyscio-kiekis",
      "isspletimo-indas",
      "debitas",
      "vamzdzio-dydis",
      "vamzdzio-nuostoliai",
      "grindiniai-konturai",
      "radiatoriai-en442",
      "boilerio-isspletimo-indas",
      "boilerio-talpa",
      "momentinis-kv",
      "freono-trasa",
    ],
  },
  {
    id: "dujos",
    title: "Dujotiekis",
    hint: "Vamzdis ir įvado darbai",
    ids: ["dujotiekio-vamzdis", "dujotiekio-irengimas"],
  },
];

function money(value) {
  return `${Math.round(value)} €`;
}

function GroupMark({ id }) {
  const common = "h-8 w-8";
  if (id === "suvartojimas") {
    return (
      <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4" y="16" width="5" height="12" rx="1.5" fill="#1c3d36" />
        <rect x="13" y="10" width="5" height="18" rx="1.5" fill="#c46b2d" />
        <rect x="22" y="6" width="5" height="22" rx="1.5" fill="#8a5a32" />
      </svg>
    );
  }
  if (id === "dujos") {
    return (
      <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 22c0-6 8-8 8-14 4 4 8 6 8 12a8 8 0 1 1-16 2z" fill="#c46b2d" />
        <path d="M14 22a2 2 0 1 0 4 0c0-2-2-3-2-6-1.4 1.6-2 3-2 6z" fill="#f6f3ee" />
      </svg>
    );
  }
  return (
    <svg className={common} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="5" y="14" width="22" height="8" rx="4" fill="#1c3d36" />
      <circle cx="10" cy="18" r="2" fill="#f6f3ee" />
      <circle cx="22" cy="18" r="2" fill="#c46b2d" />
      <path d="M11 14V9a5 5 0 0 1 10 0v5" fill="none" stroke="#8a5a32" strokeWidth="2" />
    </svg>
  );
}

function visible(field, values) {
  return typeof field.show !== "function" || field.show(values);
}

export default function Calculators() {
  const [id, setId] = useState("sildymo-kaina");
  const [values, setValues] = useState(() => defaultValues("sildymo-kaina"));
  const calculator = CALCULATORS.find((item) => item.id === id) || CALCULATORS[0];
  const group = GROUPS.find((item) => item.ids.includes(calculator.id)) || GROUPS[0];
  const items = group.ids
    .map((itemId) => CALCULATORS.find((item) => item.id === itemId))
    .filter(Boolean);
  const result = useMemo(() => computeCalculator(calculator.id, values), [calculator.id, values]);

  function openCalculator(nextId) {
    setId(nextId);
    setValues(defaultValues(nextId));
  }

  function setField(key, value) {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "material" && next.forced && next.forced !== "auto") {
        const allowed = pipeSizeOptions(value).map(([option]) => option);
        if (!allowed.includes(next.forced)) next.forced = "auto";
      }
      return next;
    });
  }

  const fields = calculator.fields.filter((field) => visible(field, values));

  function openGroup(groupId) {
    const next = GROUPS.find((item) => item.id === groupId);
    if (next && !next.ids.includes(calculator.id)) openCalculator(next.ids[0]);
  }

  return (
    <section className="mb-8">
      <p className="text-xs uppercase tracking-[0.18em] text-[#8a5a32]">Skaičiuoklės</p>
      <h2 className="text-2xl md:text-3xl font-semibold text-[#1c3d36] mt-1">Pasirinkite, ką skaičiuoti</h2>
      <p className="text-sm text-[#5c675f] mt-2 max-w-2xl">
        Suvartojimas, šildymo sistema ir dujotiekis atskirai. Skaičiai tie patys kaip Hidraulikos programėlėje.
        Suskystintos dujos — grynas propanas, 12,8 kWh/kg.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
        {GROUPS.map((item) => {
          const active = item.id === group.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => openGroup(item.id)}
              className={active
                ? "text-left rounded-2xl border border-[#1c3d36] bg-[#1c3d36] text-[#f6f3ee] p-4 shadow-sm"
                : "text-left rounded-2xl border border-[#e4ddd2] bg-white text-[#1c3d36] p-4 hover:border-[#c46b2d]"}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#f6f3ee]">
                <GroupMark id={item.id} />
              </span>
              <span className="block mt-3 font-medium">{item.title}</span>
              <span className={active ? "block text-sm text-[#d9cfc2]" : "block text-sm text-[#6d756f]"}>{item.hint}</span>
            </button>
          );
        })}
      </div>
      <div className="bg-white rounded-3xl border border-[#e4ddd2] shadow-sm overflow-hidden md:grid md:grid-cols-[240px_1fr]">
        <nav className="bg-[#fbf8f3] border-b md:border-b-0 md:border-r border-[#e4ddd2] p-3 flex md:block gap-2 overflow-x-auto" aria-label={group.title}>
          {items.map((item) => {
            const active = item.id === calculator.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => openCalculator(item.id)}
                className={active
                  ? "shrink-0 md:w-full text-left px-3 py-2 rounded-xl text-sm bg-[#1c3d36] text-white"
                  : "shrink-0 md:w-full text-left px-3 py-2 rounded-xl text-sm text-[#31403b] hover:bg-white"}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="p-4 md:p-6">
          <h3 className="text-xl font-semibold text-[#1c3d36]">{calculator.name}</h3>
          <p className="text-sm text-[#5c675f] mb-4 mt-1">{calculator.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={values[field.key]}
                material={values.material}
                onChange={(value) => setField(field.key, value)}
              />
            ))}
          </div>
          {result.bills ? <Bills result={result} /> : <ResultCard result={result} />}
        </div>
      </div>
    </section>
  );
}

function Field({ field, value, material, onChange }) {
  if (field.type === "choice") {
    const options = field.key === "forced" ? pipeSizeOptions(material) : field.options;
    return (
      <label className="block text-sm text-slate-600">
        {field.label}
        <select
          className="border rounded-lg w-full p-2 mt-1 text-slate-900"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map(([option, label]) => (
            <option key={option} value={option}>{label}</option>
          ))}
        </select>
      </label>
    );
  }
  return (
    <label className="block text-sm text-slate-600">
      {field.label}
      <input
        className="border rounded-lg w-full p-2 mt-1 text-slate-900"
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))}
      />
    </label>
  );
}

function Bills({ result }) {
  const widest = Math.max(...result.bills.map((row) => row.eur), 1);
  return (
    <div>
      <p className="text-sm text-slate-600 mb-3">
        Šildymas {Math.round(result.heat)} kWh · karštas vanduo {Math.round(result.dhw)} kWh.
        Pigiausia {money(result.numeric)} per metus.
      </p>
      <div className="space-y-4">
        {result.bills.map((row) => {
          const cheap = Math.round(row.eur) === Math.round(result.numeric);
          return (
            <div key={row.id} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className={cheap ? "font-semibold text-slate-900" : "text-slate-800"}>{row.name}</span>
                <span className="shrink-0 tabular-nums">{money(row.eur)}</span>
              </div>
              {row.hint ? <p className="text-xs text-[#8a5a32]">{row.hint}</p> : null}
              <div className="mt-1 h-2 rounded bg-[#f3efe8] overflow-hidden">
                <div
                  className={cheap ? "h-full bg-[#c46b2d]" : "h-full bg-[#1c3d36]"}
                  style={{ width: `${Math.max(2, (row.eur / widest) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{row.quantity} per metus</p>
            </div>
          );
        })}
      </div>
      <Note result={result} />
    </div>
  );
}

function ResultCard({ result }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{result.headlineLabel}</p>
      <p className="text-3xl font-semibold text-[#1c3d36] mb-3">{result.headline}</p>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {result.rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-slate-100 py-1">
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-slate-900 text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <Note result={result} />
    </div>
  );
}

function Note({ result }) {
  return (
    <div className="mt-3 text-sm text-slate-500">
      <p>{result.note}</p>
      {(result.links || (result.link ? [result.link] : [])).map((item) => (
        <p key={item.href} className="mt-1">
          <a className="text-sky-700 underline" href={item.href} target="_blank" rel="noopener noreferrer">
            {item.label}
          </a>
        </p>
      ))}
    </div>
  );
}
