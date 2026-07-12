const crypto = require("crypto");

const DEFAULT_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
const DEFAULT_QUERY_STATUS_ENDPOINT =
  "https://test-payment.momo.vn/v2/gateway/api/query";

function getConfig() {
  return {
    partnerCode: process.env.MOMO_PARTNER_CODE?.trim(),
    accessKey: process.env.MOMO_ACCESS_KEY?.trim(),
    secretKey: process.env.MOMO_SECRET_KEY?.trim(),
    endpoint: process.env.MOMO_ENDPOINT?.trim() || DEFAULT_ENDPOINT,
    queryStatusEndpoint:
      process.env.MOMO_QUERY_STATUS_ENDPOINT?.trim() ||
      DEFAULT_QUERY_STATUS_ENDPOINT,
    redirectUrl: process.env.MOMO_REDIRECT_URL?.trim(),
    ipnUrl: process.env.MOMO_IPN_URL?.trim(),
    requestType: process.env.MOMO_REQUEST_TYPE?.trim() || "captureWallet",
  };
}

function assertConfig(config = getConfig()) {
  const missingKeys = [];
  if (!config.partnerCode) missingKeys.push("MOMO_PARTNER_CODE");
  if (!config.accessKey) missingKeys.push("MOMO_ACCESS_KEY");
  if (!config.secretKey) missingKeys.push("MOMO_SECRET_KEY");
  if (!config.redirectUrl) missingKeys.push("MOMO_REDIRECT_URL");
  if (!config.ipnUrl) missingKeys.push("MOMO_IPN_URL");

  if (missingKeys.length) {
    const error = new Error(
      `Missing MoMo environment variables: ${missingKeys.join(", ")}`
    );
    error.missingKeys = missingKeys;
    throw error;
  }
}

function sign(rawSignature, secretKey) {
  return crypto
    .createHmac("sha256", secretKey)
    .update(rawSignature)
    .digest("hex");
}

async function createPayment(order) {
  const config = getConfig();
  assertConfig(config);

  const amount = Math.round(order.amount + (order.ship || 0));
  const requestId = `${order.code}-${Date.now()}`;
  const orderId = String(order._id);
  const orderInfo = `Thanh toan don hang ${order.code}`;
  const redirectUrl = config.redirectUrl.includes("?")
    ? `${config.redirectUrl}&orderId=${orderId}`
    : `${config.redirectUrl}?orderId=${orderId}`;
  const extraData = "";

  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${config.ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${config.partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${config.requestType}`;

  const requestBody = {
    partnerCode: config.partnerCode,
    partnerName: "Swiggi",
    storeId: "SwiggiStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl: config.ipnUrl,
    lang: "vi",
    requestType: config.requestType,
    autoCapture: true,
    extraData,
    orderGroupId: "",
    signature: sign(rawSignature, config.secretKey),
  };

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok || data.resultCode !== 0) {
    const error = new Error(data.message || "Khong the tao thanh toan MoMo");
    error.response = data;
    throw error;
  }

  return {
    provider: "MoMo",
    amount,
    requestId,
    orderId,
    payUrl: data.payUrl,
    deeplink: data.deeplink,
    qrCodeUrl: data.qrCodeUrl,
    message: data.message,
  };
}

function verifyIpn(payload) {
  const config = getConfig();
  assertConfig(config);

  const rawSignature =
    `accessKey=${config.accessKey}` +
    `&amount=${payload.amount}` +
    `&extraData=${payload.extraData || ""}` +
    `&message=${payload.message}` +
    `&orderId=${payload.orderId}` +
    `&orderInfo=${payload.orderInfo}` +
    `&orderType=${payload.orderType}` +
    `&partnerCode=${payload.partnerCode}` +
    `&payType=${payload.payType}` +
    `&requestId=${payload.requestId}` +
    `&responseTime=${payload.responseTime}` +
    `&resultCode=${payload.resultCode}` +
    `&transId=${payload.transId}`;

  return sign(rawSignature, config.secretKey) === payload.signature;
}

module.exports = {
  assertConfig,
  createPayment,
  verifyIpn,
};
