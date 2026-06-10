import { useContext, useEffect } from "react";
import { BiHome, BiMessage } from "react-icons/bi";
import { PiPhoneCall } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { SidebarContext } from "../context/SidebarContext";
import { userProfile } from "../features/user/userSlice";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {   isLoggedIn } = useSelector((state) => state.user);
  const { isActive, closeSidebar } = useContext(SidebarContext);
  const token = localStorage.getItem("accessToken");
  useEffect(() => {
    if (token) {
      dispatch(userProfile(token));
    }
  }, [dispatch, token, navigate]);

  console.log(isLoggedIn);
  return (
    <>
      <nav id="main-nav" className={`customer-side-nav ${isActive ? "is-open" : ""}`} onClick={(event) => {
        const link = event.target.closest("a[href]");
        if (link && link.getAttribute("href") !== "#") {
          closeSidebar();
        }
      }}>
        <div className="customer-side-nav-header">
          <img alt="Swiggi" src="/img/logo_web.png" />
          <button type="button" onClick={closeSidebar} aria-label="Close menu">
            &times;
          </button>
        </div>
        <ul className="second-nav">
          <li>
            <Link to="home">
              <i className="feather-home mr-2"></i> Trang chủ
            </Link>
          </li>
          <li>
            <Link to="my_order">
              <i className="feather-list mr-2"></i> Đơn hàng của tôi
            </Link>
          </li>
          {token ? (
            <li>
              <Link to="#">
                <i className="feather-user mr-2"></i> Người dùng
              </Link>
              <ul>
                <li>
                  <Link to="profile">Tài khoản</Link>
                </li>
                <li>
                  <Link to="favorites">Hỗ trợ giao hàng</Link>
                </li>
                <li>
                  <Link to="contact">Liên hệ</Link>
                </li>
                <li>
                  <Link to="terms">Điều khoản sử dụng</Link>
                </li>
                <li>
                  <Link to="privacy">Chính sách bảo mật</Link>
                </li>
              </ul>
            </li>
          ) : (
            <li>
              <Link to="#">
                <i className="feather-edit-2 mr-2"></i> Đăng nhập
              </Link>
              <ul>
                <li>
                  <Link to="login">Đăng nhập</Link>
                </li>
                <li>
                  <Link to="signup">Đăng ký</Link>
                </li>
              </ul>
            </li>
          )}

          <li>
            <Link to="map">
              <i className="feather-map-pin mr-2"></i> Live Map
            </Link>
          </li>
        </ul>
        <ul className="bottom-nav">
          <li className="email">
            <Link className="text-danger" to="home">
              <p className="h5 m-0">
                <BiHome />
              </p>
              Trang chủ
            </Link>
          </li>
          <li className="github">
            <Link to="faq">
              <p className="h5 m-0">
                <BiMessage />
              </p>
              Câu hỏi thường gặp
            </Link>
          </li>
          <li className="ko-fi">
            <Link to="contact">
              <p className="h5 m-0">
                <PiPhoneCall />
              </p>
              Trợ giúp
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
