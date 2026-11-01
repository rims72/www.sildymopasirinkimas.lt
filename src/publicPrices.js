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

export function applyPublicPrice(device, priceBook) {
  const entry = priceBook.models[device.id];
  if (!entry) {
    return { ...device, price_verified: false };
  }

  const summary = summarizeOffers(entry.offers);
  const lowest = summary.lowest;
  return {
    ...device,
    model: entry.model || device.model,
    sku: entry.sku,
    price_note: entry.note || null,
    price_eur: lowest.price_eur,
    price_average_eur: summary.average_eur,
    price_offer_count: summary.count,
    price_checked: priceBook.checked_on,
    price_verified: true,
    vendors: [
      {
        name: lowest.shop,
        url: lowest.url,
        price_eur: lowest.price_eur,
      },
    ],
  };
}

export function withPublicPrices(devices, priceBook) {
  return devices.map((device) =>
    applyPublicPrice(
      {
        ...device,
        gas_required: device.fuel === "gas",
        own_power_plant_required: Boolean(device.own_power_plant_required),
      },
      priceBook
    )
  );
}
