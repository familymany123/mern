import axios from "axios";
import { Fragment, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CiDollar } from "react-icons/ci";
import { FaBars, FaMinus, FaPlus, FaTrash } from "react-icons/fa";
import { FaAnglesDown, FaPercent } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { SidebarContext } from "../../context/SidebarContext";
import {
  addItemToCart,
  clearCart,
  fetchCartItems,
  removeItemFromCart,
  updateCartItem,
} from "../../features/cart/cartSlice";
import { fetchCoupons } from "../../features/coupons/couponSlice";
import { createOrder, createOrderVnpay } from "../../features/order/orderSlice";
import { formatMoney } from "../../utils/formatMoney";

const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let orderId = '';
  for (let i = 0; i < 14; i++) {
    orderId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return orderId;
};

function Checkout() {
  const { items } = useSelector((state) => state.cart);
  const { coupons } = useSelector((state) => state.coupons);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [distanceShip, setDistanceShip] = useState("0 km");
  const [timeShip, setTimeShip] = useState("0 phút");
  const [phiShip, setPhiShip] = useState(0);
  const [shippingAddress, setShippingAddress] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar } = useContext(SidebarContext);
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      dispatch(clearCart());
      return;
    }

    dispatch(fetchCartItems());
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchCoupons(123));
  }, [dispatch]);

  const handleRemoveItem = (id) => {
    dispatch(removeItemFromCart(id));
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      const foodIds = items.map((item) => item.food?._id).filter(Boolean);

      if (!foodIds.length) {
        setRecommendations([]);
        return;
      }

      try {
        const response = await baseApi.post("/recommendations", {
          foodIds,
          limit: 4,
        });
        setRecommendations(response.data.recommendations || []);
      } catch {
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [items]);

  const handleAddRecommendation = async (foodId) => {
    try {
      await dispatch(addItemToCart({ food: foodId, toppings: [], quantity: 1 })).unwrap();
      await dispatch(fetchCartItems()).unwrap();
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      if (!localStorage.getItem("accessToken")) {
        dispatch(clearCart());
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await baseApi.get("/users/profile");
        if (response.data?._id) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.log(error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();

    const checkAndRemoveQuery = async () => {
      const params = new URLSearchParams(location.search);
      const vnp_ResponseCode = params.get("vnp_ResponseCode");

      if (vnp_ResponseCode && vnp_ResponseCode !== "00") {
        navigate(location.pathname, { replace: true });
      } else if (vnp_ResponseCode && vnp_ResponseCode == "00") {
        const orderData = {
          phone: params.get("phone"),
          address: params.get("address"),
          coupon: params.get("coupon"),
          ship: params.get("ship"),
          distance: params.get("distance"),
          timeShip: params.get("timeShip"),
          payment: "Bank",
        };
        await dispatch(createOrder(orderData)).unwrap();
        navigate("/orderSuccess");
      }
    };

    checkAndRemoveQuery();
  }, []);
  const handleUpdateQuantity = (id, quantity) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ id, quantity }));
    } else {
      toast.error("Số lượng phải lớn hơn 0");
    }
  };
  // random code
  const handleApplyDiscount = () => {
    // Kiểm tra xem có mã giảm giá nào được nhập không
    // Nếu không thì thông báo lỗi
    if (!discountCode) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    const normalizedDiscountCode = discountCode.trim().toUpperCase();
    const coupon = coupons.find(
      (coupon) => coupon.code.toString().trim().toUpperCase() === normalizedDiscountCode
    );

    if (!coupon) {
      toast.error("Ma giam gia khong ton tai");
      return;
    }

    if (coupon.quantity <= 0) {
      toast.error("Ma giam gia da het luot su dung");
      return;
    }

    toast.success("Ap dung ma giam gia thanh cong");

    setDiscountCode(normalizedDiscountCode);
    setDiscount(coupon.value);
  };
  const calculateTotal = () => {
    const total = items.reduce((total, cart) => {

      const toppingPrice = cart.toppings.reduce(
        (toppingTotal, topping) => toppingTotal + topping.price,
        0
      );
      return total + (cart.food.price + toppingPrice) * cart.quantity;
    }, 0);

    return total - (total * discount) / 100;
  };
  const totalMoney = () => {
    const total = items.reduce((total, cart) => {

      const toppingPrice = cart.toppings.reduce(
        (toppingTotal, topping) => toppingTotal + topping.price,
        0
      );
      return total + (cart.food.price + toppingPrice) * cart.quantity;
    }, 0);

    return total;
  };


  const handleChange = (event) => {
    setSelectedBank(event.target.value);
  };

  const handleCheckout = async () => {
    setLoading(true);
    if (items.length === 0) {
      setLoading(false);
      return;
    }
    try {
      if (!selectedDistrict || !selectedWard) {
        toast.error("Vui lòng chọn địa chỉ giao hàng");
        return;
      }

      if (!phone) {
        toast.error("Vui lòng nhập số điện thoại");
        return;
      }

      if (!homeAddress) {
        toast.error("Vui lòng nhập địa chỉ nhà");
        return;
      }

      if (!phiShip || distanceShip === "0 km") {
        toast.error("Dia chi nay nam ngoai pham vi giao hang hoac chua tinh duoc phi ship");
        return;
      }
      const fullAddress =
        shippingAddress ||
        homeAddress +
          ", " +
          wards.find((ward) => ward.code == selectedWard)?.name +
          ", " +
          districts.find((district) => district.code == selectedDistrict)?.name +
          ", TP. Hồ Chí Minh, Việt Nam";

      const orderData = {
        phone,
        address: fullAddress,
        coupon: discountCode,
        ship: phiShip,
        distance: distanceShip,
        timeShip: timeShip,
      };

      if (selectedBank == "" || !selectedBank) {
        await dispatch(createOrder(orderData)).unwrap();
        navigate("/orderSuccess");
      } else {
        const vnpayUrl = await dispatch(createOrderVnpay(
          {
            amount: calculateTotal(),
            orderId: generateOrderId(),
            coupon: discountCode,
            ship: phiShip,
            distance: distanceShip,
            timeShip: timeShip,
            address: fullAddress,
            phone,
          }
        )).unwrap();
        window.location.href = vnpayUrl.data;
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDeliveryAreas = async () => {
      try {
        const areaResponse = await baseApi.get("/shipping/areas");
        const provinceCode = areaResponse.data.provinceCode || 79;
        const deliveryAreaCodes = areaResponse.data.deliveryAreaCodes || [];

        const response = await axios.get(
          `https://provinces.open-api.vn/api/v1/p/${provinceCode}?depth=2`
        );
        const allDistricts = response.data.districts || [];
        const filteredDistricts = allDistricts.filter((item) =>
          deliveryAreaCodes.includes(Number(item.code))
        );

        setDistricts(filteredDistricts);
        setSelectedDistrict("");
        setSelectedWard("");
        setWards([]);
      } catch (error) {
        console.error("Lỗi lấy quận TP.HCM:", error);
        setDistricts([]);
        setWards([]);
      }
    };

    fetchDeliveryAreas();
  }, []);

  useEffect(() => {
    setDistanceShip("0 km");
    setTimeShip("0 phút");
    setPhiShip(0);
    setShippingAddress("");

    if (selectedDistrict) {
      axios
        .get(`https://provinces.open-api.vn/api/v1/d/${selectedDistrict}?depth=2`)
        .then((response) => {
          setWards(response.data.wards || []);
          setSelectedWard("");
        })
        .catch((error) => {
          console.error("Lỗi lấy phường/xã:", error);
          setWards([]);
        });
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);
  useEffect(() => {
    if (user) {
      setPhone(user.phone);
    }
  }, [user]);
  const calculateShippingFee = async (wardCode = selectedWard, address = homeAddress) => {
    const ward = wards.find((item) => item.code == wardCode);
    const district = districts.find((item) => item.code == selectedDistrict);

    if (!ward || !district || !address.trim()) {
      setDistanceShip("0 km");
      setTimeShip("0 phút");
      setPhiShip(0);
      setShippingAddress("");
      return;
    }

    try {
      const response = await baseApi.post("/shipping/calculate", {
        districtCode: district.code,
        districtName: district.name,
        wardCode: ward.code,
        wardName: ward.name,
        homeAddress: address.trim(),
      });

      const { distanceKm, durationMinute, fee, address: fullAddress } = response.data;
      setDistanceShip(`${Number(distanceKm).toFixed(2)} km`);
      setTimeShip(`${durationMinute} phút`);
      setPhiShip(fee);
      setShippingAddress(fullAddress);
    } catch {
      setDistanceShip("0 km");
      setTimeShip("0 phút");
      setPhiShip(0);
      setShippingAddress("");
    }
  };

  const handelChonPhuong = async (e) => {
    const wardCode = e.target.value;
    setSelectedWard(wardCode);
    await calculateShippingFee(wardCode, homeAddress);
  };

  useEffect(() => {
    if (!selectedWard || !selectedDistrict) return;

    const timer = setTimeout(() => {
      calculateShippingFee(selectedWard, homeAddress);
    }, 600);

    return () => clearTimeout(timer);
  }, [homeAddress, selectedWard, selectedDistrict, wards, districts]);
  if (!isAuthenticated) {
    return (
      <div
        className=""
        style={{
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          flexDirection: "column",
        }}
      >
        <h3> Vui lòng đăng nhập để tiếp tục</h3>
        <div className="new-acc d-flex align-items-center justify-content-center">
          <Link to={"/login"} className="btn btn-primary">
            Đăng nhập
          </Link>
          <Link to={"/faq"} className="btn btn-light">
            Trợ giúp
          </Link>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="d-none">
        <div className="bg-primary border-bottom p-3 d-flex align-items-center justify-content-between">
          <h4 className="font-weight-bold m-0 text-white">Ưu đãi</h4>
          <div onClick={toggleSidebar}>
            <FaBars size={24} color="white" />
          </div>
        </div>
      </div>

      <div className="container position-relative">
        <div className="py-5 row">
          <div className={calculateTotal() != 0 ? "col-md-8 mb-3" : "col-md-8 mb-3 d-none"}>
            <div>
              <div className="osahan-cart-item mb-3 rounded shadow-sm bg-white overflow-hidden">
                <div className="osahan-cart-item-profile bg-white p-3">
                  <div className="d-flex flex-column">
                    <h6 className="mb-3 font-weight-bold">Địa chỉ giao hàng</h6>
                    <div className="row">
                      {/* danh sasch tinh thanh pho */}

                      <div className="col-md-4 mb-3">
                        <label htmlFor="district">Địa Chỉ Quận</label>
                        <select
                          id="district"
                          className="form-control"
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                        >
                          <option value="">Chọn quận</option>
                          {districts.map((district) => (
                            <option
                              key={district.code}
                              value={district.code}
                            >
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="ward">Địa Chỉ Phường</label>
                        <select
                          id="ward"
                          className="form-control"
                          value={selectedWard}
                          onChange={(e) => handelChonPhuong(e)}
                          disabled={!selectedDistrict}
                        >
                          <option value="">Chọn phường</option>
                          {wards.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                          type="text"
                          id="phone"
                          className="form-control"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>

                      <div className="col-md-12 mb-3">
                        <label htmlFor="homeAddress">Địa chỉ nhà</label>
                        <input
                          type="text"
                          id="homeAddress"
                          className="form-control"
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder="Nhập địa chỉ nhà"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="accordion mb-3 rounded shadow-sm bg-white overflow-hidden"
                id="accordionExample"
              >
                <div className="osahan-card bg-white overflow-hidden">
                  <div className="osahan-card-header" id="headingThree">
                    <h2 className="mb-0">
                      <button
                        className="d-flex p-3 align-items-center btn btn-link w-100"
                        type="button"
                        data-toggle="collapse"
                        data-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                      >
                        <CiDollar
                          style={{
                            marginRight: "1rem",
                          }}
                          size={20}
                        />
                        Tiền mặt khi giao hàng
                        <FaAnglesDown
                          style={{
                            marginLeft: "auto",
                          }}
                        />
                      </button>
                    </h2>
                  </div>
                  <div
                    id="collapseThree"
                    className="collapse"
                    aria-labelledby="headingThree"
                    data-parent="#accordionExample"
                  >
                    <div className="border-top p-3 osahan-card-body">
                      <h6 className="mb-3 font-weight-bold">Tiền mặt</h6>
                      <p className="m-0">
                        Vui lòng giữ sẵn số tiền lẻ chính xác để giúp chúng tôi
                        phục vụ bạn tốt hơn
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="accordion mb-3 rounded shadow-sm bg-white overflow-hidden"
                id="accordionExample"
              >
                <div className="osahan-card bg-white overflow-hidden">
                  <div className="osahan-card-header" id="headingThree">
                    <h2 className="mb-0">
                      <button
                        className="d-flex p-3 align-items-center btn btn-link w-100"
                        type="button"
                        data-toggle="collapse"
                        data-target="#collapseThree2"
                        aria-expanded="false"
                        aria-controls="collapseThree2"
                      >
                        <CiDollar
                          style={{
                            marginRight: "1rem",
                          }}
                          size={20}
                        />
                        Chuyển khoản ngân hàng
                        <FaAnglesDown
                          style={{
                            marginLeft: "auto",
                          }}
                        />
                      </button>
                    </h2>
                  </div>
                  <div
                    id="collapseThree2"
                    className="collapse"
                    aria-labelledby="headingThree"
                    data-parent="#accordionExample"
                  >
                    <div className="border-top p-3 osahan-card-body">
                      <h6 className="mb-3 font-weight-bold">VNPay</h6>
                      <p className="m-0">
                        Hệ thống sẽ thực hiện thanh toán chính xác số tiền của đơn hàng.
                      </p>
                    </div>
                    <div className="border-top p-3 osahan-card-body">
                      <select className="form-control" value={selectedBank} onChange={handleChange}>
                        <option value="">Chọn phương thức</option>
                        <option value="VNPAY">Thanh toán trên cổng VNPay</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={calculateTotal() != 0 ? "col-md-4" : "col-md-12"}>
            <div className="osahan-cart-item rounded rounded shadow-sm overflow-hidden bg-white sticky_sidebar">
              <div className="d-flex border-bottom osahan-cart-item-profile bg-white p-3">
                <h5 className="font-weight-bold">Giỏ hàng của bạn</h5>
              </div>
              <div className="bg-white border-bottom py-2">
                {
                  calculateTotal() == 0
                    ?
                    <p className="text-center mt-3">Giỏ hàng hiện đang trống!</p>
                    :
                    null
                }
                {items.map((item, index) => (
                  <Fragment key={index}>
                    <div className="d-flex align-items-start p-3 border-bottom">
                      <div className="mr-3">
                        <img
                          src={item.food.image}
                          alt={item.food.name}
                          className="img-fluid rounded"
                          width="60"
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{item.food.name}</h6>

                        <p className="mb-0 text-dark">
                          {formatMoney(item.food.price)} VND
                        </p>
                      </div>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-secondary mr-2"
                          onClick={() =>
                            handleUpdateQuantity(item._id, item.quantity - 1)
                          }
                        >
                          <FaMinus />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary ml-2"
                          onClick={() =>
                            handleUpdateQuantity(item._id, item.quantity + 1)
                          }
                        >
                          <FaPlus />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger ml-2"
                          onClick={() => handleRemoveItem(item._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {item.toppings.map((topping, i) => (
                      <div
                        key={i}
                        className="gold-members d-flex align-items-center justify-content-between px-3 py-2 border-bottom"
                      >
                        <div className="media align-items-center">
                          <div className="mr-2">&middot;</div>
                          <div className="media-body">
                            <p className="m-0"> {topping.name} </p>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <p className="text-gray mb-0 float-right ml-2 text-muted small">
                            {formatMoney(topping.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
              {recommendations.length > 0 && (
                <div className="bg-white border-bottom p-3">
                  <h6 className="font-weight-bold mb-3">Gợi ý thêm cho bạn</h6>
                  {recommendations.map((food) => (
                    <div
                      key={food._id}
                      className="d-flex align-items-center justify-content-between mb-3"
                    >
                      <div className="d-flex align-items-center">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="img-fluid rounded mr-3"
                          width="54"
                          height="54"
                          style={{ objectFit: "cover" }}
                        />
                        <div>
                          <p className="mb-1 font-weight-bold">{food.name}</p>
                          <p className="mb-0 text-muted small">
                            {formatMoney(food.price)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleAddRecommendation(food._id)}
                      >
                        Thêm
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {
                calculateTotal() != 0
                  ?
                  <>
                    <div className="bg-white p-3 py-3 border-bottom clearfix">
                      <div className="input-group-sm mb-2 input-group">
                        <input
                          placeholder="Nhập mã giảm giá"
                          type="text"
                          className="form-control"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <div className="input-group-append">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleApplyDiscount}
                          >
                            <FaPercent className="mr-2" />
                            Áp dụng
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-3 clearfix border-bottom">
                      <p className="mb-1">
                        Tạm tính{" "}
                        <span className="float-right text-dark">
                          {formatMoney(totalMoney())}
                        </span>
                      </p>

                      <p className="mb-1 text-danger">
                        Giảm giá
                        <span className="float-right text-danger">
                          -{formatMoney((discount * totalMoney()) / 100)}
                        </span>
                      </p>
                      {/* tien ship */}
                      <p className="mb-1 text-danger">
                        Giao hàng ({distanceShip}):
                        <span className="float-right text-danger">
                          +{formatMoney(phiShip)}
                        </span>
                      </p>
                      <p className="mb-1 text-danger">
                        Thời gian giao:
                        <span className="float-right text-danger">
                          {timeShip}
                        </span>
                      </p>
                      <p className="mb-1 text-success">
                        Tính tổng
                        <span className="float-right text-success">
                          {formatMoney(calculateTotal())} + {formatMoney(phiShip)}
                        </span>
                      </p>
                      <hr />

                      <h6 className="font-weight-bold mb-0">
                        Tổng tiền{" "}
                        <span className="float-right">
                          {formatMoney(calculateTotal() + phiShip)}
                        </span>
                      </h6>
                    </div>
                    <div className="p-3">
                      <button
                        className="btn btn-success btn-block btn-lg"
                        onClick={handleCheckout}
                        disabled={loading}
                      >
                        {loading
                          ?
                          "Đang xử lý..."
                          :
                          calculateTotal() == 0
                            ?
                            `Quay về mua hàng`
                            :
                            `Trả ${formatMoney(calculateTotal() + phiShip)}`}
                        <i className="feather-arrow-right"></i>
                      </button>
                    </div>
                  </>
                  :
                  null
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
