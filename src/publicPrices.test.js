import priceBook from "./priceQuotes.json";
import catalog from "./catalog.json";
import { applyPublicPrice, summarizeOffers, withPublicPrices } from "./publicPrices";

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

test("leaves other brands unverified", () => {
  const daikin = applyPublicPrice(
    devices.find((device) => device.id === "hp-daikin-8"),
    priceBook
  );
  expect(daikin.price_verified).toBe(false);
  expect(daikin.price_eur).toBe(5200);
});

test("average rounds half up to the nearest euro", () => {
  expect(summarizeOffers([{ price_eur: 1 }, { price_eur: 2 }]).average_eur).toBe(2);
});
