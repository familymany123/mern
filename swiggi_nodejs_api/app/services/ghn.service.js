const GHN_TEST_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api";
const DEFAULT_HCM_PROVINCE_ID = 202;
const DEFAULT_SERVICE_TYPE_ID = 2;

const getConfig = () => ({
  baseUrl: (process.env.GHN_BASE_URL || GHN_TEST_BASE_URL).replace(/\/$/, ""),
  token: process.env.GHN_TOKEN,
  shopId: Number(process.env.GHN_SHOP_ID),
  fromDistrictId: Number(process.env.GHN_FROM_DISTRICT_ID),
  fromWardCode: process.env.GHN_FROM_WARD_CODE,
  provinceId: Number(process.env.GHN_PROVINCE_ID || DEFAULT_HCM_PROVINCE_ID),
  serviceTypeId: Number(process.env.GHN_SERVICE_TYPE_ID || DEFAULT_SERVICE_TYPE_ID),
  defaultWeight: Number(process.env.GHN_DEFAULT_WEIGHT || 1000),
  defaultLength: Number(process.env.GHN_DEFAULT_LENGTH || 20),
  defaultWidth: Number(process.env.GHN_DEFAULT_WIDTH || 20),
  defaultHeight: Number(process.env.GHN_DEFAULT_HEIGHT || 10),
});

const assertConfigured = (config) => {
  const missingKeys = [];

  if (!config.token) missingKeys.push("GHN_TOKEN");
  if (!config.shopId) missingKeys.push("GHN_SHOP_ID");
  if (!config.fromDistrictId) missingKeys.push("GHN_FROM_DISTRICT_ID");
  if (!config.fromWardCode) missingKeys.push("GHN_FROM_WARD_CODE");

  if (missingKeys.length) {
    const error = new Error(`Missing GHN configuration: ${missingKeys.join(", ")}`);
    error.statusCode = 500;
    throw error;
  }
};

const request = async (path, { method = "GET", body, includeShopId = false } = {}) => {
  const config = getConfig();
  assertConfigured(config);

  const response = await fetch(`${config.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Token: config.token,
      ...(includeShopId ? { ShopId: String(config.shopId) } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json();

  if (!response.ok || payload.code >= 400) {
    const error = new Error(payload.message || "GHN API request failed");
    error.statusCode = response.status || 502;
    error.payload = payload;
    throw error;
  }

  return payload.data;
};

const getDistricts = async () => {
  const config = getConfig();
  const query = new URLSearchParams({ province_id: String(config.provinceId) });
  return request(`/master-data/district?${query.toString()}`);
};

const getWards = async (districtId) => {
  const query = new URLSearchParams({ district_id: String(districtId) });
  return request(`/master-data/ward?${query.toString()}`);
};

const getAvailableServices = async (toDistrictId) => {
  const config = getConfig();

  return request("/v2/shipping-order/available-services", {
    method: "POST",
    body: {
      shop_id: config.shopId,
      from_district: config.fromDistrictId,
      to_district: Number(toDistrictId),
    },
  });
};

const calculateFee = async ({ toDistrictId, toWardCode, orderValue = 0 }) => {
  const config = getConfig();
  const services = await getAvailableServices(toDistrictId);
  const service = services.find((item) => item.service_type_id === config.serviceTypeId) || services[0];

  if (!service) {
    const error = new Error("GHN does not support delivery service for this address");
    error.statusCode = 400;
    throw error;
  }

  const fee = await request("/v2/shipping-order/fee", {
    method: "POST",
    includeShopId: true,
    body: {
      from_district_id: config.fromDistrictId,
      from_ward_code: config.fromWardCode,
      service_id: service.service_id,
      service_type_id: service.service_type_id,
      to_district_id: Number(toDistrictId),
      to_ward_code: String(toWardCode),
      height: config.defaultHeight,
      length: config.defaultLength,
      weight: config.defaultWeight,
      width: config.defaultWidth,
      insurance_value: Math.min(Number(orderValue) || 0, 5000000),
      coupon: null,
      items: [],
    },
  });

  return { service, fee };
};

const calculateLeadtime = async ({ toDistrictId, toWardCode, serviceId }) => {
  const config = getConfig();

  return request("/v2/shipping-order/leadtime", {
    method: "POST",
    includeShopId: true,
    body: {
      from_district_id: config.fromDistrictId,
      from_ward_code: config.fromWardCode,
      to_district_id: Number(toDistrictId),
      to_ward_code: String(toWardCode),
      service_id: Number(serviceId),
    },
  });
};

module.exports = {
  calculateFee,
  calculateLeadtime,
  getConfig,
  getDistricts,
  getWards,
};
