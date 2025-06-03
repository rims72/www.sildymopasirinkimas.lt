import React, { useState } from 'react';

export default function HeatingAssistant() {
  const [form, setForm] = useState({
    houseType: '',
    area: '',
    hasGas: false,
    hasBoiler: false,
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
    const mockResponse = {
      recommendation: 'Siūlome Viessmann Vitodens 100-W',
      reason: 'Tinka 100 m² namui, turi integruotą boilerį, efektyvus ir nebrangus',
    };
    setResult(mockResponse);
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
          <label className="block">Biudžetas (€)</label>
          <input type="number" name="budget" value={form.budget} onChange={handleChange} className="w-full border p-2 rounded" />
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
