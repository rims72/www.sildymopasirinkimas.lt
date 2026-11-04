export function addDays(isoDate, days) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function priceStatus(checkedOn, today, validDays = 7) {
  const validUntil = addDays(checkedOn, validDays);
  return {
    valid_until: validUntil,
    current: today <= validUntil,
  };
}

export function summarizeOffers(offers) {
  if (!offers || offers.length === 0) return null;
  const sorted = [...offers].sort((a, b) => a.price_eur - b.price_eur);
  const sum = sorted.reduce((total, offer) => total + offer.price_eur, 0);
  return {
    lowest: sorted[0],
    average_eur: Math.round(sum / sorted.length),
    count: sorted.length,
  };
}

export function applyPublicPrice(device, priceBook, today) {
  const entry = priceBook.models[device.id];
  if (!entry) {
    return { ...device, price_verified: false, price_current: false };
  }

  const summary = summarizeOffers(entry.offers);
  const lowest = summary.lowest;
  const checkedOn = entry.checked_on || priceBook.checked_on;
  const asOf = today || checkedOn;
  const status = priceStatus(checkedOn, asOf, priceBook.valid_days ?? 7);
  return {
    ...device,
    model: entry.model || device.model,
    sku: entry.sku,
    price_note: entry.note || null,
    price_eur: lowest.price_eur,
    price_average_eur: summary.average_eur,
    price_offer_count: summary.count,
    price_checked: checkedOn,
    price_valid_until: status.valid_until,
    price_current: status.current,
    price_verified: true,
    power_kw: entry.power_kw != null ? entry.power_kw : device.power_kw,
    dhw: entry.dhw || device.dhw,
    refrigerant: entry.refrigerant || device.refrigerant,
    vendors: [
      {
        name: lowest.shop,
        url: lowest.url,
        price_eur: lowest.price_eur,
      },
    ],
  };
}

export function withPublicPrices(devices, priceBook, today) {
  return devices.map((device) =>
    applyPublicPrice(
      {
        ...device,
        gas_required: device.fuel === "gas",
        own_power_plant_required: Boolean(device.own_power_plant_required),
      },
      priceBook,
      today
    )
  );
}

export function refreshModelQuotes(priceBook, modelId, update) {
  const previous = priceBook.models[modelId] || {};
  return {
    ...priceBook,
    checked_on: update.checked_on,
    models: {
      ...priceBook.models,
      [modelId]: {
        ...previous,
        model: update.model ?? previous.model,
        sku: update.sku ?? previous.sku,
        note: update.note === undefined ? previous.note : update.note,
        checked_on: update.checked_on,
        offers: update.offers,
      },
    },
  };
}
