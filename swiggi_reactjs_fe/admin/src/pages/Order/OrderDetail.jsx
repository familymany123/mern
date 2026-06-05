import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { fetchOrderDetail } from "../../features/order/orderSlice";
import { fetchUserById } from "../../features/user/userSlice";
import { formatMoney } from "../../utils/formatMoney";

const OrderDetail = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { order, loading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.user);
  useEffect(() => {
    dispatch(fetchOrderDetail(id));
  }, [dispatch, id]);
  //   fetch user by id
  useEffect(() => {
    if (order?.order?.user) {
      dispatch(fetchUserById(order?.order?.user));
    }
  }, [dispatch, order]);

  if (loading) {
    return <Spinner />;
  }
  console.log(order);
  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Chi tiết đơn hàng</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h5>Thông tin đơn hàng</h5>
                  <p>
                    <strong>Mã đơn hàng: </strong>
                    {order?.order?.code}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {
                      // kiểm tra trạng thái đơn hàng để hiển thị màu sắc
                      order?.order?.status === "Pending" && (
                        <span className="badge badge-warning">
                          {order?.order?.status}
                        </span>
                      )
                    }
                    {order?.order?.status === "Completed" && (
                      <span className="badge badge-success">
                        {order?.order?.status}
                      </span>
                    )}
                    {order?.order?.status === "Cancelled" && (
                      <span className="badge badge-danger">
                        {order?.order?.status}
                      </span>
                    )}
                  </p>
                  <p>
                    <strong>Tổng tiền:</strong>{" "}
                    {formatMoney(order?.order?.amount)}
                  </p>
                  <p>
                    <strong>Mã giảm giá:</strong>{" "}
                    {order?.order?.coupon}
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>Thông tin người đặt</h5>
                  <p>
                    <strong>Tên: </strong>
                    {user?.fullname}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {order?.order?.phone}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {order?.order?.address}
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col-12">
                  <h5>Thành phần đơn hàng</h5>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover table-valign-middle table-bordered">
                      <thead>
                        <tr>
                          <th>Tên món ăn</th>
                          <th>Giá</th>
                          <th>Số lượng</th>
                          <th>Toppings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order?.detailOrders?.map((detail) => (
                          <tr key={detail._id}>
                            <td>{detail.food.name}</td>
                            <td>{formatMoney(detail.food.price)}</td>
                            <td>{detail.quantity}</td>
                            <td>
                              {detail.toppings.map((topping) => (
                                <div key={topping._id}>
                                  {topping.name} - {formatMoney(topping.price)}
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
