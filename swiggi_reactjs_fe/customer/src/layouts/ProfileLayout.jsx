import { useContext, useState } from "react";
import {
  BiChevronDown,
  BiChevronRight,
  BiLockAlt,
  BiPhoneCall,
} from "react-icons/bi";
import { BsInfoCircle, BsTruck } from "react-icons/bs";
import { FaBars, FaRegCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { SidebarContext } from "../context/SidebarContext";
import { setActiveTab } from "../features/tab/tabSlice";
const ProfileLayout = () => {
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("accessToken");

  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.tab.activeTab);

  const handleTabClick = (tab) => {
    dispatch(setActiveTab(tab));
  };
  const handleClose = () => setShow(!show);
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <>
      <div className="osahan-profile">
        <div className="d-none">
          <div className="bg-primary border-bottom p-3 d-flex align-items-center justify-content-between">
            <h4 className="font-weight-bold m-0 text-white">Hồ sơ</h4>
            <div onClick={toggleSidebar}>
              <FaBars size={24} color="white" />
            </div>
          </div>
        </div>
        <div className="container position-relative">
          <div className="py-5 osahan-profile row">
            <div className="col-md-4 mb-3">
              <div className="bg-white rounded shadow-sm sticky_sidebar overflow-hidden">
                <Link to="profile" className="">
                  <div className="d-flex align-items-center p-3">
                    <div className="right">
                      <h6 className="mb-1 font-weight-bold">
                        {user?.fullname || "Bạn chưa đăng nhập"}{" "}
                        <FaRegCheckCircle color="green" />
                      </h6>
                      <p className="text-muted m-0 small">
                        {user?.email || "Vui lòng đăng nhập "}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="bg-white profile-details">
                  {token && (
                    <>
                      <Link
                        className="d-flex align-items-center border-bottom p-3"
                        data-toggle="modal"
                        data-target="#inviteModal"
                        to={"/my_order"}
                        onClick={handleClose}
                      >
                        <div className="left mr-3">
                          <h6 className="font-weight-bold mb-1">
                            Thông tin đơn hàng
                          </h6>
                          <p className="small text-primary m-0">
                            Đơn hàng của bạn
                          </p>
                        </div>
                        <div className="right ml-auto">
                          <h6 className="m-0">
                            {show ? <BiChevronDown /> : <BiChevronRight />}
                          </h6>
                        </div>
                      </Link>
                    </>
                  )}

                  {/* handle show sub menu */}
                  {show ? (
                    <ul
                      className="nav nav-tabsa custom-tabsa border-0 flex-column bg-white rounded overflow-hidden shadow-sm p-2 c-t-order"
                      id="myTab"
                      role="tablist"
                    >
                      <li className="nav-item" role="presentation">
                        <Link
                          className={`nav-link border-0 text-dark py-3 ${
                            activeTab === "completed" ? "active" : ""
                          }`}
                          id="completed-tab"
                          data-toggle="tab"
                          to="/my_order#completed"
                          onClick={() => handleTabClick("completed")}
                          role="tab"
                          aria-controls="completed"
                          aria-selected={activeTab === "completed"}
                        >
                          <i className=" mr-2 text-success mb-0"></i>
                          Hoàn thành
                        </Link>
                      </li>
                      <li className="nav-item border-top" role="presentation">
                        <Link
                          className={`nav-link border-0 text-dark py-3 ${
                            activeTab === "progress" ? "active" : ""
                          }`}
                          id="progress-tab"
                          data-toggle="tab"
                          to="/my_order#progress"
                          onClick={() => handleTabClick("progress")}
                          role="tab"
                          aria-controls="progress"
                          aria-selected={activeTab === "progress"}
                        >
                          <i className="feather-clock mr-2 text-warning mb-0"></i>{" "}
                          Đang xử lý
                        </Link>
                      </li>
                      <li className="nav-item border-top" role="presentation">
                        <Link
                          className={`nav-link border-0 text-dark py-3 ${
                            activeTab === "pending" ? "active" : ""
                          }`}
                          id="pending-tab"
                          data-toggle="tab"
                          to="/my_order#pending"
                          role="tab"
                          onClick={() => handleTabClick("pending")}
                          aria-controls="pending"
                          aria-selected={activeTab === "pending"}
                        >
                          <i className="feather-clock mr-2 text-warning mb-0"></i>
                          Đang chờ
                        </Link>
                      </li>
                      <li className="nav-item border-top" role="presentation">
                        <Link
                          className={`nav-link border-0 text-dark py-3 ${
                            activeTab === "canceled" ? "active" : ""
                          }`}
                          id="canceled-tab"
                          data-toggle="tab"
                          to="/my_order#canceled"
                          onClick={() => handleTabClick("canceled")}
                          role="tab"
                          aria-controls="canceled"
                          aria-selected={activeTab === "canceled"}
                        >
                          <i className="feather-x-circle mr-2 text-danger mb-0"></i>{" "}
                          Đã hủy
                        </Link>
                      </li>
                    </ul>
                  ) : null}

                  <Link
                    to="faq"
                    className="d-flex w-100 align-items-center border-bottom px-3 py-4"
                  >
                    <div className="left mr-3">
                      <h6 className="font-weight-bold m-0 text-dark">
                        <BsTruck className="rounded-circle mr-2 pl-1" />
                        Câu hỏi thường gặp
                      </h6>
                    </div>
                    <div className="right ml-auto">
                      <h6 className=" m-0">
                        <BiChevronRight />
                      </h6>
                    </div>
                  </Link>
                  <Link
                    to="contact"
                    className="d-flex w-100 align-items-center border-bottom px-3 py-4"
                  >
                    <div className="left mr-3">
                      <h6 className="font-weight-bold m-0 text-dark">
                        <BiPhoneCall className="rounded-circle mr-2" />
                        Liên hệ
                      </h6>
                    </div>
                    <div className="right ml-auto">
                      <h6 className=" m-0">
                        <BiChevronRight />
                      </h6>
                    </div>
                  </Link>
                  <Link
                    to="terms"
                    className="d-flex w-100 align-items-center border-bottom px-3 py-4"
                  >
                    <div className="left mr-3">
                      <h6 className="font-weight-bold m-0 text-dark">
                        <BsInfoCircle className="rounded-circle mr-2" />
                        Điều khoản sử dụng
                      </h6>
                    </div>
                    <div className="right ml-auto">
                      <h6 className=" m-0">
                        <BiChevronRight />
                      </h6>
                    </div>
                  </Link>
                  <Link
                    to="privacy"
                    className="d-flex w-100 align-items-center px-3 py-4"
                  >
                    <div className="left mr-3">
                      <h6 className="font-weight-bold m-0 text-dark">
                        <BiLockAlt className="rounded-circle mr-2" />
                        Chính sách bảo mật
                      </h6>
                    </div>
                    <div className="right ml-auto">
                      <h6 className=" m-0">
                        <BiChevronRight />
                      </h6>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-md-8 mb-3">
              <div className="rounded shadow-sm">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileLayout;
