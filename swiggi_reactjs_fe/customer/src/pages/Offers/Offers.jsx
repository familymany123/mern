import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaBars } from "react-icons/fa";
import { FaPercent } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { SidebarContext } from "../../context/SidebarContext";
import { fetchCoupons } from "../../features/coupons/couponSlice";

const Offers = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const dispatch = useDispatch();
  const { coupons, currentPage } = useSelector((state) => state.coupons);
  useEffect(() => {
    dispatch(fetchCoupons(currentPage));
  }, [dispatch, currentPage]);
  const { toggleSidebar } = useContext(SidebarContext);

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
      <div className="offer-section">
        <div className="container">
          <div className="py-5 d-flex align-items-center">
            <div>
              <h2 className="text-white">Ưu đãi dành cho bạn</h2>
              <p className="h6 text-white">
                Khám phá các ưu đãi và ưu đãi hàng đầu dành riêng cho bạn!
              </p>
            </div>
            <div className="ml-auto">
              <img
                alt="#"
                src="img/offers.png"
                className="img-fluid offers_img"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm">
        <div className="container">
          <div className="bg-white">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <div
                  className="px-0 py-3 nav-link text-dark h6 border-0 mb-0 active"
                  id="profile-tab"
                  data-toggle="tab"
                  to="#profile"
                  role="tab"
                  style={{ cursor: "pointer" }}
                  aria-controls="profile"
                  onClick={() => handleTabChange("profile")}
                  aria-selected="false"
                >
                  Ưu đãi thanh toán/Phiếu giảm giá
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="tab-content" id="myTabContent">
          {activeTab === "profile" && (
            <div
              className="tab-pane fade show active py-4"
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <h5 className="mb-3 mt-0">Phiếu giảm giá có sẵn</h5>
              <div className="row">
                {coupons.map((coupon) => (
                  <div className="col-md-4 mb-3" key={coupon._id}>
                    <div className="bg-white shadow-sm rounded p-4">
                      <p className="h6 mb-3">
                        <FaPercent className="text-primary" />
                        <span className="ml-3">{coupon.code}</span>
                      </p>
                      <p className="font-weight-bold mb-2">{coupon.title}</p>
                      <p className="mb-4">{coupon.description}</p>
                      <div className="d-flex   ">
                        <p>số lượng :</p>
                        <p className="mb-4">{coupon.quantity}</p>
                      </div>
                      <p className="mb-4">
                        {new Date(coupon.expiry_date).toLocaleString()}
                      </p>
                      <Link
                        to="#"
                        className="btn btn-outline-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(coupon.code).then(
                            function () {
                              toast.success("Copied to clipboard");
                            },
                            function () {
                              alert("Copy failed");
                            }
                          );
                        }}
                      >
                        COPY CODE
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Offers;
