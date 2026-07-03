const deliveryDistanceService = require("../services/deliveryDistance.service");
const ghnService = require("../services/ghn.service");

class ShippingController {
  areas(req, res) {
    const ghnConfig = ghnService.getConfig();
    const deliveryConfig = deliveryDistanceService.getConfig();

    return res.json({
      provider: "GHN",
      mode: ghnConfig.baseUrl.includes("dev-online-gateway") ? "test" : "production",
      ghnProvinceId: ghnConfig.provinceId,
      maxDistanceKm: deliveryConfig.maxDistanceKm,
    });
  }

  async districts(req, res) {
    try {
      const districts = await ghnService.getDistricts();
      return res.json({ provider: "GHN", districts });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message || "Khong the lay danh sach quan/huyen tu GHN",
        provider: "GHN",
      });
    }
  }

  async wards(req, res) {
    try {
      const { districtId } = req.params;

      if (!districtId) {
        return res.status(400).json({ message: "Vui long chon quan/huyen" });
      }

      const wards = await ghnService.getWards(districtId);
      return res.json({ provider: "GHN", wards });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message || "Khong the lay danh sach phuong/xa tu GHN",
        provider: "GHN",
      });
    }
  }

  async calculate(req, res) {
    const { districtCode, districtName, wardCode, wardName, homeAddress, orderValue } =
      req.body;

    if (!districtCode || !districtName || !wardCode || !wardName || !homeAddress) {
      return res.status(400).json({
        message: "Vui long nhap day du dia chi giao hang",
      });
    }

    try {
      const fullAddress = `${homeAddress}, ${wardName}, ${districtName}, TP. Ho Chi Minh, Viet Nam`;
      const areaAddress = `${wardName}, ${districtName}, TP. Ho Chi Minh, Viet Nam`;
      const deliveryRoute = await deliveryDistanceService.calculateDeliveryRoute(
        [fullAddress, areaAddress]
      );
      const { fee, service } = await ghnService.calculateFee({
        toDistrictId: districtCode,
        toWardCode: wardCode,
        orderValue,
      });

      return res.json({
        deliverable: true,
        provider: "GHN",
        serviceName: service.short_name || "GHN",
        distanceKm: deliveryRoute.distanceKm,
        durationMinute: deliveryRoute.durationMinute,
        maxDistanceKm: deliveryRoute.maxDistanceKm,
        fee: fee.total,
        address: fullAddress,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message || "Khong the tinh phi van chuyen",
        deliverable: false,
        provider: "GHN",
        distanceKm: error.distanceKm || 0,
        maxDistanceKm: error.maxDistanceKm,
        durationMinute: 0,
        fee: 0,
      });
    }
  }
}

module.exports = new ShippingController();
