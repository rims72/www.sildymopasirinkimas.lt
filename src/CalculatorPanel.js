import React, { useMemo, useState } from "react";
import {
  CALCULATORS,
  computeCalculator,
  defaultValues,
  pipeSizeOptions,
} from "./calculators";

function money(value) {
  return `${Math.round(value)} €`;
}

function visible(field, values) {
  return typeof field.show !== "function" || field.show(values);
}

export default function Calculators() {
  const [id, setId] = useState("sildymo-kaina");
  const [values, setValues] = useState(() => defaultValues("sildymo-kaina"));
  const calculator = CALCULATORS.find((item) => item.id === id) || CALCULATORS[0];
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

  return (
    <section className="bg-white rounded-2xl shadow-sm border p-4 md:p-6 mb-6">
      <h2 className="text-lg font-medium mb-1">Skaičiuoklės</h2>
      <p className="text-sm text-slate-500 mb-4">
        Visos Hidraulikos skaičiuoklės ir suskystintų dujų balionų kaina per metus.
        Skaičiai tie patys kaip programėlėje. Suskystintos dujos programėlėje nebuvo:
        čia grynas propanas, 12,8 kWh/kg.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {CALCULATORS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === calculator.id}
            className={item.id === calculator.id
              ? "px-3 py-1.5 rounded-full text-sm bg-slate-800 text-white"
              : "px-3 py-1.5 rounded-full text-sm border text-slate-700 bg-white"}
            onClick={() => openCalculator(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <h3 className="text-base font-medium">{calculator.name}</h3>
      <p className="text-sm text-slate-500 mb-4">{calculator.description}</p>
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
      <div className="space-y-2">
        {result.bills.map((row) => {
          const cheap = Math.round(row.eur) === Math.round(result.numeric);
          return (
            <div key={row.id} className="grid grid-cols-[7.5rem_1fr_5.5rem] items-center gap-2 text-sm">
              <span className={cheap ? "font-semibold text-slate-900" : "text-slate-700"}>{row.name}</span>
              <div className="h-3 rounded bg-slate-100 overflow-hidden">
                <div
                  className={cheap ? "h-full bg-slate-800" : "h-full bg-slate-400"}
                  style={{ width: `${Math.max(2, (row.eur / widest) * 100)}%` }}
                />
              </div>
              <span className="text-right tabular-nums">{money(row.eur)}</span>
              <span className="col-start-2 text-xs text-slate-500">{row.quantity} per metus</span>
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
      <p className="text-2xl font-semibold mb-3">{result.headline}</p>
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
      {result.link ? (
        <p className="mt-1">
          <a className="text-sky-700 underline" href={result.link.href} target="_blank" rel="noopener noreferrer">
            {result.link.label}
          </a>
        </p>
      ) : null}
    </div>
  );
}
