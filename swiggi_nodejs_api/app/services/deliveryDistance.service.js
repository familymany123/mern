const DEFAULT_SHOP_LOCATION = {
  lat: 10.8506,
  lon: 106.7719,
};
const DEFAULT_SHOP_ADDRESS =
  "So 1 Vo Van Ngan, Binh Tho, Thu Duc, Ho Chi Minh City, Vietnam";
const DEFAULT_MAX_DISTANCE_KM = 15;
const DEFAULT_AVG_SPEED_KMH = 25;

const getConfig = () => ({
  shopAddress: process.env.SHOP_ADDRESS || DEFAULT_SHOP_ADDRESS,
  shopLat: Number(process.env.SHOP_LAT || DEFAULT_SHOP_LOCATION.lat),
  shopLon: Number(process.env.SHOP_LON || DEFAULT_SHOP_LOCATION.lon),
  maxDistanceKm: Number(
    process.env.MAX_DELIVERY_DISTANCE_KM || DEFAULT_MAX_DISTANCE_KM
  ),
  avgSpeedKmh: Number(process.env.DELIVERY_AVG_SPEED_KMH || DEFAULT_AVG_SPEED_KMH),
  userAgent:
    process.env.GEOCODING_USER_AGENT ||
    "swiggi-food-delivery-thesis/1.0",
});

const normalizeAddress = (address) =>
  address
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");

const fetchJson = async (url, headers = {}) => {
  const response = await fetch(url, { headers });
  const responseText = await response.text();
  let payload = null;

  try {
    payload = JSON.parse(responseText);
  } catch {
    payload = { message: responseText };
  }

  if (!response.ok) {
    const error = new Error(payload.message || "Distance provider request failed");
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const geocodeByPhoton = async (address) => {
  const config = getConfig();
  const query = new URLSearchParams({
    limit: "1",
    q: normalizeAddress(address),
  });
  const payload = await fetchJson(`https://photon.komoot.io/api/?${query.toString()}`, {
    "User-Agent": config.userAgent,
  });
  const coordinates = payload.features?.[0]?.geometry?.coordinates;

  if (!coordinates) {
    const error = new Error("Photon khong tim thay toa do dia chi giao hang");
    error.statusCode = 400;
    throw error;
  }

  return {
    lat: Number(coordinates[1]),
    lon: Number(coordinates[0]),
  };
};

const geocodeByNominatim = async (address) => {
  const config = getConfig();
  const query = new URLSearchParams({
    format: "json",
    limit: "1",
    countrycodes: "vn",
    q: normalizeAddress(address),
  });

  const results = await fetchJson(
    `https://nominatim.openstreetmap.org/search?${query.toString()}`,
    { "User-Agent": config.userAgent }
  );

  if (!results.length) {
    const error = new Error("Khong tim thay toa do dia chi giao hang");
    error.statusCode = 400;
    throw error;
  }

  return {
    lat: Number(results[0].lat),
    lon: Number(results[0].lon),
  };
};

const geocodeAddress = async (address) => {
  try {
    return await geocodeByPhoton(address);
  } catch {
    return geocodeByNominatim(address);
  }
};

const getRoute = async (from, to) => {
  const config = getConfig();
  const coordinates = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const query = new URLSearchParams({
    overview: "false",
    alternatives: "false",
    steps: "false",
  });
  const payload = await fetchJson(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?${query.toString()}`,
    { "User-Agent": config.userAgent }
  );

  if (payload.code !== "Ok" || !payload.routes?.length) {
    const error = new Error("Khong tinh duoc quang duong giao hang");
    error.statusCode = 400;
    throw error;
  }

  return payload.routes[0];
};

const getFallbackDurationMinute = (distanceKm) => {
  const { avgSpeedKmh } = getConfig();
  return Math.max(10, Math.ceil((distanceKm / avgSpeedKmh) * 60));
};

const toRadians = (degree) => (degree * Math.PI) / 180;

const getHaversineDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const latDistance = toRadians(to.lat - from.lat);
  const lonDistance = toRadians(to.lon - from.lon);
  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const geocodeFirstAvailable = async (addresses) => {
  let lastError = null;

  for (const address of addresses) {
    try {
      return await geocodeAddress(address);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

const calculateDeliveryRoute = async (deliveryAddress) => {
  const config = getConfig();
  const shop = { lat: config.shopLat, lon: config.shopLon };
  const addresses = Array.isArray(deliveryAddress)
    ? deliveryAddress.filter(Boolean)
    : [deliveryAddress];
  const destination = await geocodeFirstAvailable(addresses);
  let distanceKm = 0;
  let durationMinute = 0;

  try {
    const route = await getRoute(shop, destination);
    distanceKm = Number((route.distance / 1000).toFixed(2));
    durationMinute = Math.max(
      getFallbackDurationMinute(distanceKm),
      Math.ceil(route.duration / 60)
    );
  } catch (error) {
    console.error("OSRM route failed, fallback to haversine:", error.message);
    distanceKm = Number((getHaversineDistanceKm(shop, destination) * 1.35).toFixed(2));
    durationMinute = getFallbackDurationMinute(distanceKm);
  }

  if (distanceKm > config.maxDistanceKm) {
    const error = new Error(
      `Dia chi nam ngoai pham vi giao hang ${config.maxDistanceKm}km`
    );
    error.statusCode = 400;
    error.distanceKm = distanceKm;
    error.maxDistanceKm = config.maxDistanceKm;
    throw error;
  }

  return {
    distanceKm,
    durationMinute,
    maxDistanceKm: config.maxDistanceKm,
  };
};

module.exports = {
  calculateDeliveryRoute,
  getConfig,
};
