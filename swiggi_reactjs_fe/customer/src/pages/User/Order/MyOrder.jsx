import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { cancelOrder, fetchOrders } from "../../../features/order/orderSlice";
import { formatMoney } from "../../../utils/formatMoney";

const MyOrder = () => {
  const { orders, currentPage } = useSelector((state) => state.orders);
  const activeTab = useSelector((state) => state.tab.activeTab);
  const dispatch = useDispatch();
  useEffect(() => {
    console.log("fetchOrders");
    dispatch(fetchOrders({ page: currentPage, limit: 100 }));
  }, [currentPage, dispatch]);
  if (!orders || orders.length === 0) {
    return <p>Không có đơn hàng nào.</p>;
  }

  const completedOrders = orders.filter(
    (order) => order.status === "Completed"
  );
  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const progressOrders = orders.filter(
    (order) => order.status === "Processing"
  );
  const canceledOrders = orders.filter((order) => order.status === "Cancelled");

  const handleCancelOrder = (id) => () => {
    if (window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) {
      dispatch(cancelOrder(id));
    }
  };
  const renderOrders = (orders) =>
    orders.map((order, index) => (
      <div key={index} className="pb-3">
        <div className="p-3 rounded shadow-sm bg-white">
          <div className="d-flex border-bottom pb-3">
            <div>
              <p className="mb-0">{order.location}</p>
              <p>{order.code}</p>
              <p className="mb-0 small">
                <Link to={`/order-detail/${order._id}`}>Xem chi tiết</Link>
              </p>
            </div>
            <div className="ml-auto">
              <p
                className={` text-white py-1 px-2 rounded small mb-1 ${
                  order.status === "Completed"
                    ? "bg-success"
                    : order.status === "Processing"
                    ? "bg-warning"
                    : order.status === "Pending"
                    ? "bg-secondary"
                    : "bg-danger"
                } `}
              >
                {order.status === "Completed"
                  ? "Đã giao hàng"
                  : order.status === "Processing"
                  ? "Đang xử lý"
                  : order.status === "Pending"
                  ? "Chờ xử lý"
                  : "Đã hủy"}
              </p>
              <p className="small font-weight-bold text-center">
                <i className="feather-clock"></i>{" "}
                {new Date(order.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="d-flex pt-3">
            <div className="text-muted m-0 ml-auto mr-3 small">
              Tổng tiền
              <br />
              <span className="text-dark font-weight-bold">
                {formatMoney(order.amount + (order.ship ? order.ship : 0))}
              </span>
            </div>
            <div className="text-end">
              {order.status === "Pending" && (
                <button
                  className="btn btn-primary px-3 mr-2"
                  onClick={handleCancelOrder(order._id)}
                >
                  Hủy đơn
                </button>
              )}

              <Link to="/contact" className="btn btn-outline-primary px-3">
                Trợ giúp
              </Link>
            </div>
          </div>
        </div>
      </div>
    ));

  return (
    <>
      <div className="tab-content" id="myTabContent">
        <div
          className={`tab-pane fade ${
            activeTab === "completed" ? "show active" : ""
          }`}
          id="completed"
          role="tabpanel"
          aria-labelledby="completed-tab"
        >
          <div className="order-body">{renderOrders(completedOrders)}</div>
        </div>
        <div
          className={`tab-pane fade ${
            activeTab === "progress" ? "show active" : ""
          }`}
          id="progress"
          role="tabpanel"
          aria-labelledby="progress-tab"
        >
          <div className="order-body">{renderOrders(progressOrders)}</div>
        </div>
        <div
          className={`tab-pane fade ${activeTab === "pending" ? "show active" : ""}`}
          id="pending"
          role="tabpanel"
          aria-labelledby="pending-tab"
        >
          <div className="order-body">{renderOrders(pendingOrders)}</div>
        </div>
        <div
          className={`tab-pane fade ${activeTab === "canceled" ? "show active" : ""}`}
          id="canceled"
          role="tabpanel"
          aria-labelledby="canceled-tab"
        >
          <div className="order-body">{renderOrders(canceledOrders)}</div>
        </div>
      </div>
    </>
  );
};

export default MyOrder;
