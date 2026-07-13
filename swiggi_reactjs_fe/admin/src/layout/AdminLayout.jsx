import { useEffect } from "react";
import toast from "react-hot-toast";
import { Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import API_BASE_URL from "../api/config";
import { ControlSidebar, Sidebar } from "../components";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on("newOrder", (order) => {
      const orderCode = order?.code ? ` ${order.code}` : "";

      toast.custom(
        (t) => (
          <div
            className={`bg-white shadow rounded p-3 border-left border-success ${
              t.visible ? "animate__animated animate__fadeInRight" : ""
            }`}
            style={{ minWidth: 320 }}
          >
            <div className="d-flex align-items-start">
              <div className="text-success mr-3">
                <i className="fas fa-bell fa-lg" />
              </div>
              <div className="flex-grow-1">
                <strong>Có đơn hàng mới{orderCode}</strong>
                <p className="mb-2 small text-muted">
                  Vui lòng kiểm tra và xử lý đơn sớm.
                </p>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate("/orders");
                  }}
                >
                  Xem đơn
                </button>
              </div>
            </div>
          </div>
        ),
        { duration: 20000 }
      );
    });

    return () => {
      socket.off("newOrder");
      socket.disconnect();
    };
  }, [navigate]);

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
