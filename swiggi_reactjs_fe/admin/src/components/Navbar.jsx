import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logOut } from "../features/auth/authSlice";
import { useAuth } from "../hooks/adminUtils";

const Navbar = () => {
  // logoutHandle function
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const logoutHandle = () => {
    dispatch(logOut());
    auth.logOut();
    toast.success("Logout Successfully");
    navigate("/login");
  };

  const toggleSidebar = (event) => {
    event.preventDefault();

    if (window.innerWidth <= 992) {
      document.body.classList.toggle("sidebar-open");
      return;
    }

    document.body.classList.toggle("sidebar-collapse");
  };

  const toggleFullscreen = async (event) => {
    event.preventDefault();

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Unable to toggle fullscreen", error);
    }
  };

  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <li className="nav-item">
          <a
            aria-label="Thu gọn menu"
            className="nav-link"
            href="#"
            onClick={toggleSidebar}
            role="button"
          >
            <i className="fas fa-bars"></i>
          </a>
        </li>
      </ul>

      <ul className="navbar-nav ml-auto">
         

         
        <li className="nav-item dropdown user-menu">
          <span
            onClick={logoutHandle}
            className="nav-link dropdown-toggle"
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            data-toggle="dropdown"
          >
          
            <span className="d-none d-md-inline">Đăng xuất</span>
          </span>
           
        </li>
        <li className="nav-item">
          <a
            className="nav-link"
            href="#"
            onClick={toggleFullscreen}
            role="button"
          >
            <i className="fas fa-expand-arrows-alt"></i>
          </a>
        </li>
         
      </ul>
    </nav>
  );
};

export default Navbar;
