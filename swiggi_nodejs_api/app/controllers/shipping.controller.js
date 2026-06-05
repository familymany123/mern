const {
  HCM_CODE,
  MAX_DELIVERY_DISTANCE_KM,
  deliveryAreaCodes,
  getShippingEstimate,
} = require("../config/shipping.config");

class ShippingController {
  areas(req, res) {
    return res.json({
      provinceCode: HCM_CODE,
      deliveryAreaCodes,
      maxDistanceKm: MAX_DELIVERY_DISTANCE_KM,
    });
  }

  calculate(req, res) {
    const { districtCode, districtName, wardCode, wardName, homeAddress } =
      req.body;

    if (!districtCode || !districtName || !wardCode || !wardName || !homeAddress) {
      return res.status(400).json({
        message: "Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 \u0111\u1ecba ch\u1ec9 giao h\u00e0ng",
      });
    }

    const shippingEstimate = getShippingEstimate({ districtCode, wardName });

    if (
      !shippingEstimate ||
      shippingEstimate.distanceKm > MAX_DELIVERY_DISTANCE_KM
    ) {
      return res.status(400).json({
        message: "\u0110\u1ecba ch\u1ec9 n\u00e0y n\u1eb1m ngo\u00e0i ph\u1ea1m vi giao h\u00e0ng",
        deliverable: false,
        distanceKm: 0,
        durationMinute: 0,
        fee: 0,
      });
    }

    return res.json({
      deliverable: true,
      distanceKm: shippingEstimate.distanceKm,
      durationMinute: shippingEstimate.durationMinute,
      fee: shippingEstimate.fee,
      address: `${homeAddress}, ${wardName}, ${districtName}, TP. H\u1ed3 Ch\u00ed Minh, Vi\u1ec7t Nam`,
    });
  }
}

module.exports = new ShippingController();
