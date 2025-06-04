import React, { useState } from 'react';

export default function HeatingAssistant() {
  const [form, setForm] = useState({
    houseType: '',
    area: '',
    hasGas: false,
    hasBoiler: false,
    hasElectricity: false,
    hasSolar: false,
    budget: '',
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/devices.json');
      const data = await res.json();
      const filtered = data.filter((device) => {
        return (
          (form.houseType === '' || device.type === form.houseType) &&
          Number(form.area) >= device.minArea &&
          Number(form.area) <= device.maxArea &&
          (!device.requiresGas || form.hasGas) &&
          (!device.requiresElectricity || form.hasElectricity) &&
          (!device.solarOptimized || form.hasSolar) &&
          (!device.boiler || form.hasBoiler) &&
          Number(form.budget) >= device.price
        );
      });

      if (filtered.length > 0) {
        setResult({
          recommendation: filtered[0].name,
          reason: `Atitinka jūsų poreikius (${filtered[0].type} namui, ${filtered[0].price} €)`
        });
      } else {
        setResult({
          recommendation: 'Nerasta tinkamo įrenginio',
          reason: 'Bandykite padidinti biudžetą arba pakeisti sąlygas'
        });
      }
    } catch (error) {
      setResult({
        recommendation: 'Klaida',
        reason: 'Nepavyko gauti duomenų apie įrenginius'
      });
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Šildymo įrenginio parinkimas</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Namo tipas</label>
          <select name="houseType" value={form.houseType} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">-- Pasirinkite --</option>
            <option value="senas">Senas</option>
            <option value="naujas">Naujas</option>
            <option value="A+">A+ klasė</option>
          </select>
        </div>

        <div>
          <label className="block">Namo plotas (m²)</label>
          <input type="number" name="area" value={form.area} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block">Biudžetas (€)</label>
          <input type="number" name="budget" value={form.budget} onChange={handleChange} className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" name="hasGas" checked={form.hasGas} onChange={handleChange} className="mr-2" />
            Yra dujų įvadas
          </label>
        </div>

        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" name="hasBoiler" checked={form.hasBoiler} onChange={handleChange} className="mr-2" />
            Reikia boilerio
          </label>
        </div>

        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" name="hasElectricity" checked={form.hasElectricity} onChange={handleChange} className="mr-2" />
            Yra nuosava elektrinė
          </label>
        </div>

        <div>
          <label className="inline-flex items-center">
            <input type="checkbox" name="hasSolar" checked={form.hasSolar} onChange={handleChange} className="mr-2" />
            Yra saulės baterijos
          </label>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded shadow">Ieškoti sprendimo</button>
      </form>

      {result && (
        <div className="mt-6 p-4 border rounded bg-green-50">
          <h2 className="font-semibold text-lg">Rekomendacija:</h2>
          <p><strong>{result.recommendation}</strong></p>
          <p className="text-sm text-gray-700">{result.reason}</p>
        </div>
      )}
    </div>
  );
    }
