import priceBook from "./priceQuotes.json";
import catalog from "./catalog.json";
import {
  applyPublicPrice,
  refreshModelQuotes,
  summarizeOffers,
  withPublicPrices,
} from "./publicPrices";

const devices = [...catalog.premium, ...catalog.budget];

test("uses the lowest public offer and links that page", () => {
  const seven = applyPublicPrice(
    devices.find((device) => device.id === "hp-panasonic-7"),
    priceBook
  );

  expect(seven.price_eur).toBe(3820);
  expect(seven.price_average_eur).toBe(4016);
  expect(seven.price_offer_count).toBe(6);
  expect(seven.sku).toBe("WH-MDC07J3E5");
  expect(seven.vendors[0]).toEqual({
    name: "Technika Jums",
    url: "https://www.technikajums.lt/produktas/panasonic-oras-vanduo-mono-blokai/",
    price_eur: 3820,
  });
  expect(seven.vendors[0].url).not.toContain("jusuimone.lt");
});

test("prices the 9 kW and the real 12 kW T-CAP sku", () => {
  const priced = withPublicPrices(devices, priceBook);
  const nine = priced.find((device) => device.id === "hp-panasonic-9");
  const twelve = priced.find((device) => device.id === "hp-panasonic-12");

  expect(nine.price_eur).toBe(4030);
  expect(nine.price_average_eur).toBe(4155);
  expect(nine.sku).toBe("WH-MDC09J3E5");

  expect(twelve.model).toBe("Aquarea Mono T-CAP 12 kW");
  expect(twelve.sku).toBe("WH-MXC12J9E8");
  expect(twelve.price_eur).toBe(5980);
  expect(twelve.price_average_eur).toBe(6463);
  expect(twelve.vendors[0].name).toBe("Technika Jums");
});

test("leaves a device without a public quote unverified", () => {
  const mitsubishi = applyPublicPrice(
    devices.find((device) => device.id === "hp-mitsu-85"),
    priceBook
  );
  expect(mitsubishi.price_verified).toBe(false);
  expect(mitsubishi.price_eur).toBe(5900);
});

test("average rounds half up to the nearest euro", () => {
  expect(summarizeOffers([{ price_eur: 1 }, { price_eur: 2 }]).average_eur).toBe(2);
});

test("a checked price stays current for 7 days and is stale after that", () => {
  const device = devices.find((item) => item.id === "hp-panasonic-7");
  const current = applyPublicPrice(device, priceBook, "2026-11-08");
  const stale = applyPublicPrice(device, priceBook, "2026-11-09");

  expect(current.price_current).toBe(true);
  expect(current.price_valid_until).toBe("2026-11-08");
  expect(stale.price_current).toBe(false);
  expect(stale.price_eur).toBe(3820);
});

test("a later search replaces the stored offers for that device", () => {
  const refreshed = refreshModelQuotes(priceBook, "hp-panasonic-7", {
    checked_on: "2026-11-10",
    offers: [
      {
        shop: "Nauja parduotuvė",
        url: "https://example.lt/aquarea-7",
        price_eur: 3700,
      },
    ],
  });
  const device = devices.find((item) => item.id === "hp-panasonic-7");
  const priced = applyPublicPrice(device, refreshed, "2026-11-10");

  expect(refreshed.models["hp-panasonic-9"].price_eur || refreshed.models["hp-panasonic-9"].offers[0].price_eur).toBe(4030);
  expect(priced.price_eur).toBe(3700);
  expect(priced.price_checked).toBe("2026-11-10");
  expect(priced.price_current).toBe(true);
  expect(priced.vendors[0].url).toBe("https://example.lt/aquarea-7");
});

test("prices the other checked devices from the same quote list", () => {
  const priced = withPublicPrices(devices, priceBook, "2026-11-01");
  expect(priced.find((device) => device.id === "hp-daikin-8").price_eur).toBe(5587);
  expect(priced.find((device) => device.id === "hp-midea-8").price_eur).toBe(3759);
  expect(priced.find((device) => device.id === "pellet-kostrzewa-24").price_average_eur).toBe(3805);
  expect(priced.find((device) => device.id === "hp-mitsu-85").price_verified).toBe(false);
});
