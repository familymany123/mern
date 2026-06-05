const HCM_CODE = 79;
const MAX_DELIVERY_DISTANCE_KM = 15;

const deliveryAreaCodes = [
  769, // Thanh pho Thu Duc
  760, // Quan 1
  770, // Quan 3
  773, // Quan 4
  774, // Quan 5
  778, // Quan 7
  771, // Quan 10
  764, // Quan Go Vap
  765, // Quan Binh Thanh
  766, // Quan Tan Binh
  767, // Quan Tan Phu
  768, // Quan Phu Nhuan
];

const normalizeText = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase();

const getShippingEstimate = ({ districtCode, wardName }) => {
  const normalizedDistrictCode = Number(districtCode);
  const normalizedWardName = normalizeText(wardName);

  if (normalizedDistrictCode === 769) {
    if (
      normalizedWardName.includes("linh trung") ||
      normalizedWardName.includes("linh chieu") ||
      normalizedWardName.includes("truong tho") ||
      normalizedWardName.includes("binh tho")
    ) {
      return { distanceKm: 2.5, durationMinute: 12, fee: 16000 };
    }

    if (
      normalizedWardName.includes("hiep binh") ||
      normalizedWardName.includes("tam phu") ||
      normalizedWardName.includes("tam binh") ||
      normalizedWardName.includes("linh dong")
    ) {
      return { distanceKm: 5, durationMinute: 20, fee: 24000 };
    }

    return { distanceKm: 7.5, durationMinute: 28, fee: 32000 };
  }

  const shippingByDistrict = {
    765: { distanceKm: 8, durationMinute: 30, fee: 32000 },
    764: { distanceKm: 10, durationMinute: 35, fee: 32000 },
    768: { distanceKm: 11, durationMinute: 38, fee: 45000 },
    766: { distanceKm: 12, durationMinute: 42, fee: 45000 },
    760: { distanceKm: 13, durationMinute: 45, fee: 45000 },
    770: { distanceKm: 14, durationMinute: 48, fee: 45000 },
    771: { distanceKm: 14.5, durationMinute: 50, fee: 45000 },
    767: { distanceKm: 15, durationMinute: 55, fee: 45000 },
    773: { distanceKm: 15, durationMinute: 55, fee: 45000 },
    774: { distanceKm: 15, durationMinute: 55, fee: 45000 },
    778: { distanceKm: 15, durationMinute: 55, fee: 45000 },
  };

  return shippingByDistrict[normalizedDistrictCode] || null;
};

module.exports = {
  HCM_CODE,
  MAX_DELIVERY_DISTANCE_KM,
  deliveryAreaCodes,
  getShippingEstimate,
};
