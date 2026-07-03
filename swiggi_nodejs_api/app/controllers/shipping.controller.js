const ghnService = require("../services/ghn.service");

const getLeadtimeText = (leadtime) => {
  if (!leadtime?.leadtime) return "Theo GHN";

  const deliveryDate = new Date(leadtime.leadtime * 1000);
  if (Number.isNaN(deliveryDate.getTime())) return "Theo GHN";

  return deliveryDate.toLocaleDateString("vi-VN");
};

class ShippingController {
  areas(req, res) {
    const ghnConfig = ghnService.getConfig();

    return res.json({
      provider: "GHN",
      mode: ghnConfig.baseUrl.includes("dev-online-gateway") ? "test" : "production",
      ghnProvinceId: ghnConfig.provinceId,
      maxDistanceKm: null,
    });
  }

  async districts(req, res) {
    try {
      const districts = await ghnService.getDistricts();
      return res.json({ provider: "GHN", districts });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message || "Không thể lấy danh sách quận/huyện từ GHN",
        provider: "GHN",
      });
    }
  }

  async wards(req, res) {
    try {
      const { districtId } = req.params;

      if (!districtId) {
        return res.status(400).json({ message: "Vui lòng chọn quận/huyện" });
      }

      const wards = await ghnService.getWards(districtId);
      return res.json({ provider: "GHN", wards });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message || "Không thể lấy danh sách phường/xã từ GHN",
        provider: "GHN",
      });
    }
  }

  async calculate(req, res) {
    const { districtCode, districtName, wardCode, wardName, homeAddress, orderValue } =
      req.body;

    if (!districtCode || !districtName || !wardCode || !wardName || !homeAddress) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ địa chỉ giao hàng",
      });
    }

    try {
      const { fee, service } = await ghnService.calculateFee({
        toDistrictId: districtCode,
        toWardCode: wardCode,
        orderValue,
      });

      let leadtime = null;

      try {
        leadtime = await ghnService.calculateLeadtime({
          toDistrictId: districtCode,
          toWardCode: wardCode,
          serviceId: service.service_id,
        });
      } catch (error) {
        console.error("GHN leadtime failed:", error.message);
      }

      return res.json({
        deliverable: true,
        provider: "GHN",
        serviceName: service.short_name || "GHN",
        distanceKm: 0,
        durationMinute: getLeadtimeText(leadtime),
        fee: fee.total,
        address: `${homeAddress}, ${wardName}, ${districtName}, TP. Hồ Chí Minh, Việt Nam`,
      });
    } catch (error) {
      return res.status(error.statusCode || 500).json({
        message: error.message || "Không thể tính phí vận chuyển GHN",
        deliverable: false,
        provider: "GHN",
        distanceKm: 0,
        durationMinute: 0,
        fee: 0,
      });
    }
  }
}

module.exports = new ShippingController();
