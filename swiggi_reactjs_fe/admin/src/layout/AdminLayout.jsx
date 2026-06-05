import { Outlet } from "react-router-dom";
import { ControlSidebar, Sidebar } from "../components";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  return (
    <>
      <div className="wrapper">
        <Navbar />
        <Sidebar />
        <div className="content-wrapper">
          <Outlet />
        </div>
        <Footer />
        <ControlSidebar />
      </div>
    </>
  );
};

export default AdminLayout;
