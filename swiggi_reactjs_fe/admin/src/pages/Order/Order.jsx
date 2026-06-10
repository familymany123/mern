import { io } from "socket.io-client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  cancelOrder,
  fetchOrder,
  updateOrderStatus,
} from "../../features/order/orderSlice";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../api/config";

const Order = () => {
  const dispatch = useDispatch();

  const { orders } = useSelector((state) => state.orders);

  const currentPage = useSelector(
    (state) => state.orders.currentPage
  );

  const totalPages = useSelector(
    (state) => state.orders.totalPages
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [orderStatuses, setOrderStatuses] = useState({});

  const [selectedStatus, setSelectedStatus] =
    useState("all");

  // SOCKET REALTIME
  // SOCKET REALTIME
  useEffect(() => {
    dispatch(fetchOrder({ page: currentPage, limit: 10 }));

    const socket = io(API_BASE_URL);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newOrder", () => {
      dispatch(fetchOrder({ page: currentPage, limit: 10 }));
    });

    socket.on("orderStatusUpdated", () => {
      dispatch(fetchOrder({ page: currentPage, limit: 10 }));
    });

    return () => {
      socket.off("newOrder");
      socket.off("orderStatusUpdated");
      socket.disconnect();
    };
  }, [currentPage, dispatch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filterOrder = orders.filter((item) => {
    const matchesSearch = item?.code.includes(searchQuery);
    const matchesStatus =
      selectedStatus === "all" || item?.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    setOrderStatuses((prevStatuses) => ({
      ...prevStatuses,
      [orderId]: newStatus,
    }));
  };

  const handleStatusUpdate = async (orderId) => {
    const newStatus = orderStatuses[orderId];
    if (!newStatus) return;

    try {
      if (newStatus === "Cancelled") {
        dispatch(cancelOrder({ orderId }));
        return;
      }
      dispatch(updateOrderStatus({ orderId, status: newStatus }));
    } catch (error) {
      console.log(error);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: "Completed" }));
      setOrderStatuses((prevStatuses) => {
        const nextStatuses = { ...prevStatuses };
        delete nextStatuses[orderId];
        return nextStatuses;
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      dispatch(fetchOrder({ page, limit: 10 }));
    }
  };

  const handleStatusFilterChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  return (
    <>
      <div className="container-fluid pt-2">
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Đơn hàng</h3>
                <div className="card-tools">
                  <div
                    className="input-group input-group-sm"
                    style={{ width: "200px" }}
                  >
                    <input
                      type="text"
                      placeholder="Tìm kiếm"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="form-control float-right"
                    />
                    <div className="input-group-append">
                      <button type="submit" className="btn btn-default">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-tools mr-2">
                  <div
                    className="input-group input-group-sm"
                    style={{ width: "200px" }}
                  >
                    <select 
                      className="form-control"
                      value={selectedStatus}
                      onChange={handleStatusFilterChange}
                    >
                      <option hidden>--Chọn Trạng Thái--</option>
                      <option value="all">Tất cả trạng thái</option>
                      <option value="Pending">Đang duyệt</option>
                      <option value="Processing">Đang xử lý</option>
                      <option value="Cancelled">Đã hủy</option>
                      <option value="Completed">Hoàn thành</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Người dùng</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái</th>
                        <th>Ngày Đặt</th>
                        <th>Phí Giao</th>
                        <th>Thanh Toán</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterOrder.map((order) => (
                        <tr key={order._id}>
                          <td>{order?.code}</td>
                          <td>{order?.user?.fullname}</td>
                          <td>{order?.phone}</td>
                          <td>
                            <select
                              className="form-control "
                              value={orderStatuses[order?._id] || order?.status}
                              onChange={(e) =>
                                handleStatusChange(order?._id, e.target.value)
                              }
                            >
                              <option value={order?.status}>
                            {order?.status === "Pending"
                              ? "Đang duyệt"
                              : order?.status === "Processing"
                              ? "Đang xử lý"
                              : order?.status === "Completed"
                              ? "Hoàn thành"
                              : "Đã hủy"}
                          </option>

                          {order?.status === "Pending" && (
                            <option value="Processing">Chuyển sang đang xử lý</option>
                          )}

                          {(order?.status === "Pending" || order?.status === "Processing") && (
                            <option value="Completed">Chuyển sang hoàn thành</option>
                          )}

                          {order?.status !== "Completed" && order?.status !== "Cancelled" && (
                            <option value="Cancelled">Hủy đơn</option>
                          )}
                            </select>
                          </td>
                          <td>
                            {new Date(order?.created_at).toLocaleString()}
                          </td>
                          <td>
                            {(order.ship ? order.ship : 0).toLocaleString()}đ
                          </td>
                          <td>
                            {order.payment == "Cod" ? "Tiền Mặt" : "Chuyển Khoản"}
                          </td>
                          <td>
                            <button
                              className="btn btn-primary"
                              onClick={() => handleStatusUpdate(order?._id)}
                            >
                              Sửa
                            </button>
                            {order?.status !== "Completed" && order?.status !== "Cancelled" && (
                              <button
                                className="btn btn-success ml-2"
                                onClick={() => handleCompleteOrder(order?._id)}
                              >
                                Hoàn thành
                              </button>
                            )}
                            {/* chi tiết đơn hàng */}
                            <Link
                              to={`/order/${order?._id}`}
                              className="btn btn-info ml-2"
                            >
                              Chi tiết
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <nav>
                  <ul className="pagination">
                    {/* Nut Prev */}
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                    </li>

                    {/* Nut dau tien va dau `...` */}
                    {currentPage > 2 && (
                      <>
                        <li className="page-item">
                          <button className="page-link" onClick={() => handlePageChange(1)}>
                            1
                          </button>
                        </li>
                        {currentPage > 3 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                      </>
                    )}

                    {/* Trang lan can trang hien tai */}
                    {Array.from({ length: 3 }, (_, i) => {
                      const pageNumber = currentPage - 1 + i;
                      if (pageNumber > 0 && pageNumber <= totalPages) {
                        return (
                          <li
                            key={pageNumber}
                            className={`page-item ${
                              currentPage === pageNumber ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      }
                      return null;
                    })}

                    {/* Dau `...` va nut cuoi */}
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        <li className="page-item">
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      </>
                    )}

                    {/* Nut Next */}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Order;
