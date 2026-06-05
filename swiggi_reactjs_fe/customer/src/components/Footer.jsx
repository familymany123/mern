import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiHome } from "react-icons/fi";
import { IoLogoYoutube } from "react-icons/io";
import { LuMapPin, LuSearch, LuShoppingCart, LuUser } from "react-icons/lu";
import { RiInstagramFill } from "react-icons/ri";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <div className="osahan-menu-fotter fixed-bottom bg-white px-3 py-2 text-center d-none">
        <div className="row">
          <div className="col selected">
            <Link
              to="/"
              className="text-danger small font-weight-bold text-decoration-none"
            >
              <p className="h4 m-0">
                {/* <i className="feather-home text-danger"></i> */}
                <FiHome className="text-danger" />
              </p>
              Trang chủ
            </Link>
          </div>
          <div className="col">
            <Link
              to="/offers"
              className="text-dark small font-weight-bold text-decoration-none"
            >
              <p className="h4 m-0">
                <LuMapPin />
              </p>
              Ưu đãi
            </Link>
          </div>
          <div className="col bg-white rounded-circle mt-n4 px-3 py-2">
            <div className="bg-danger rounded-circle mt-n0 shadow">
              <Link
                to="/checkout"
                className="text-white small font-weight-bold text-decoration-none"
              >
                <LuShoppingCart />
              </Link>
            </div>
          </div>
          <div className="col">
            <Link
              to="/search"
              className="text-dark small font-weight-bold text-decoration-none"
            >
              <p className="h4 m-0">
                <LuSearch />
              </p>
              Tìm kiếm
            </Link>
          </div>
          <div className="col">
            <Link
              to="/profile"
              className="text-dark small font-weight-bold text-decoration-none"
            >
              <p className="h4 m-0">
                <LuUser />
              </p>
              Tài khoản
            </Link>
          </div>
        </div>
      </div>
      <footer className="section-footer border-top bg-dark">
        <div className="container">
          <section className="footer-top padding-y py-5">
            <div className="row">
              <aside className="col-md-4 footer-about">
                <article className="d-flex pb-3">
                  <div>
                    <img
                      alt="#"
                      src="img/logo_web.png"
                      className="logo-footer mr-3"
                    />
                  </div>
                  <div>
                    <h6 className="title text-white">Food</h6>
                    <p className="text-muted">
                      Đây là trang web cho phép mọi người có thể mua sắm đồ ăn
                      uống
                    </p>
                    <div className="d-flex align-items-center">
                      <Link
                        className="btn btn-icon btn-outline-light mr-1 btn-sm"
                        title="Facebook"
                        target="_blank"
                        to={"#"}
                      >
                        <FaFacebook />
                      </Link>
                      <Link
                        className="btn btn-icon btn-outline-light mr-1 btn-sm"
                        title="Instagram"
                        target="_blank"
                        to="#"
                      >
                        <RiInstagramFill />
                      </Link>
                      <Link
                        className="btn btn-icon btn-outline-light mr-1 btn-sm"
                        title="Youtube"
                        target="_blank"
                        to="#"
                      >
                        <IoLogoYoutube />
                      </Link>
                      <Link
                        className="btn btn-icon btn-outline-light mr-1 btn-sm"
                        title="Twitter"
                        target="_blank"
                        to="#"
                      >
                        <FaXTwitter />
                      </Link>
                    </div>
                  </div>
                </article>
              </aside>
              <aside className="col-sm-3 col-md-2 text-white">
               
              </aside>
              <aside className="col-sm-3 col-md-2 text-white">
                <h6 className="title">Dịch vụ</h6>
                <ul className="list-unstyled hov_footer">
                  <li>
                    <Link to="/faq" className="text-muted">
                      Câu hỏi thường gặp
                    </Link>
                  </li>
                  <li>
                    <Link to="contact" className="text-muted">
                      Liên hệ
                    </Link>
                  </li>
                  <li>
                    <Link to="terms" className="text-muted">
                      Điều khoản sử dụng
                    </Link>
                  </li>
                  <li>
                    <Link to="privacy" className="text-muted">
                      Chính sách bảo mật
                    </Link>
                  </li>
                </ul>
              </aside>
              <aside className="col-sm-3  col-md-2 text-white">
                <h6 className="title">Người dùng</h6>
                <ul className="list-unstyled hov_footer">
                  <li>
                    <Link to="login" className="text-muted">
                      Đăng nhập
                    </Link>
                  </li>
                  <li>
                    <Link to="sign-up" className="text-muted">
                      Đăng ký
                    </Link>
                  </li>
                </ul>
              </aside>
              <aside className="col-sm-3  col-md-2 text-white">
                <h6 className="title">Trang khác</h6>
                <ul className="list-unstyled hov_footer">
                  <li>
                    <Link to="trending" className="text-muted">
                      Xu hướng
                    </Link>
                  </li>
                  
                </ul>
              </aside>
            </div>
          </section>
        </div>

        <section className="footer-copyright border-top py-3 bg-light">
          <div className="container d-flex align-items-center">
            <p className="text-muted mb-0 ml-auto d-flex align-items-center">
              <Link to="#" className="d-block">
                <img alt="#" src="img/appstore.png" height="40" />
              </Link>
              <Link to="#" className="d-block ml-3">
                <img alt="#" src="img/playmarket.png" height="40" />
              </Link>
            </p>
          </div>
        </section>
      </footer>
    </>
  );
};

export default Footer;
