const STORE_COORDINATES = {
  lat: 10.8506,
  lon: 106.771,
};

const normalizeText = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const wardCoordinates = [
  {
    keywords: ["linh trung"],
    coordinates: { lat: 10.8695, lon: 106.7819 },
  },
  {
    keywords: ["linh chieu"],
    coordinates: { lat: 10.8574, lon: 106.7609 },
  },
  {
    keywords: ["truong tho", "binh tho"],
    coordinates: { lat: 10.8424, lon: 106.7618 },
  },
  {
    keywords: ["hiep binh", "tam phu", "tam binh", "linh dong"],
    coordinates: { lat: 10.8367, lon: 106.7344 },
  },
  {
    keywords: ["binh thanh"],
    coordinates: { lat: 10.8106, lon: 106.7091 },
  },
  {
    keywords: ["go vap"],
    coordinates: { lat: 10.8387, lon: 106.6653 },
  },
  {
    keywords: ["quan 1"],
    coordinates: { lat: 10.7758, lon: 106.7009 },
  },
  {
    keywords: ["quan 3"],
    coordinates: { lat: 10.7847, lon: 106.6844 },
  },
  {
    keywords: ["quan 7"],
    coordinates: { lat: 10.738, lon: 106.7218 },
  },
];

const createStableOffset = (address = "") => {
  const normalizedAddress = normalizeText(address);
  let hash = 0;

  for (let index = 0; index < normalizedAddress.length; index += 1) {
    hash = (hash * 31 + normalizedAddress.charCodeAt(index)) % 10000;
  }

  const latOffset = ((hash % 21) - 10) * 0.001;
  const lonOffset = (((Math.floor(hash / 21) % 21) - 10) * 0.001);

  return { latOffset, lonOffset };
};

export const getCoordinates = async (address) => {
  const normalizedAddress = normalizeText(address);
  const matchedArea = wardCoordinates.find((area) =>
    area.keywords.some((keyword) => normalizedAddress.includes(keyword))
  );
  const baseCoordinates = matchedArea?.coordinates || STORE_COORDINATES;
  const { latOffset, lonOffset } = createStableOffset(address);

  return {
    lat: baseCoordinates.lat + latOffset,
    lon: baseCoordinates.lon + lonOffset,
  };
};

export const fetchOrderCoordinates = async (orders) => {
  const ordersWithCoordinates = await Promise.all(
    orders.map(async (order) => {
      const coordinates = await getCoordinates(order.address);

      return {
        ...order,
        coordinates,
      };
    })
  );

  return ordersWithCoordinates;
};
