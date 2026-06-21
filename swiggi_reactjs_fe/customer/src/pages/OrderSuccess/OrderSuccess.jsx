import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { clearCart } from "../../features/cart/cartSlice";
import { resetOrder } from "../../features/order/orderSlice";
import { formatMoney } from "../../utils/formatMoney";

const LAST_VIETQR_ORDER_KEY = "lastVietQrOrder";

function OrderSuccess() {
  const dispatch = useDispatch();
  const location = useLocation();
  let storedResult = null;

  try {
    storedResult = JSON.parse(
      sessionStorage.getItem(LAST_VIETQR_ORDER_KEY)
    );
  } catch {
    sessionStorage.removeItem(LAST_VIETQR_ORDER_KEY);
  }

  const result = location.state || storedResult;
  const order = result?.order;
  const paymentInfo = result?.paymentInfo;

  useEffect(() => {
    dispatch(resetOrder());
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className="py-5 osahan-coming-soon">
      <div className="container">
        <div className="mx-auto" style={{ maxWidth: "620px" }}>
          <div className="text-center pb-3">
            <h2 className="font-weight-bold">
              {paymentInfo
                ? "Quét mã VietQR để chuyển khoản"
                : "Đơn hàng đã được tiếp nhận"}
            </h2>
            <p className="text-muted mb-0">
              Mã đơn hàng: <strong>{order?.code || "Đang cập nhật"}</strong>
            </p>
          </div>

          <div className="bg-white rounded p-4 shadow-sm">
            {paymentInfo ? (
              <>
                <div className="text-center">
                  <img
                    src={paymentInfo.qrUrl}
                    alt="Mã VietQR thanh toán đơn hàng"
                    className="img-fluid"
                    style={{ width: "320px", maxWidth: "100%" }}
                  />
                </div>
                <div className="border-top pt-3 mt-3">
                  <p className="d-flex justify-content-between mb-2">
                    <span>Ngân hàng</span>
                    <strong>{paymentInfo.bankId}</strong>
                  </p>
                  <p className="d-flex justify-content-between mb-2">
                    <span>Số tài khoản</span>
                    <strong>{paymentInfo.accountNo}</strong>
                  </p>
                  <p className="d-flex justify-content-between mb-2">
                    <span>Chủ tài khoản</span>
                    <strong>{paymentInfo.accountName}</strong>
                  </p>
                  <p className="d-flex justify-content-between mb-2">
                    <span>Số tiền</span>
                    <strong className="text-primary">
                      {formatMoney(paymentInfo.amount)}
                    </strong>
                  </p>
                  <p className="d-flex justify-content-between mb-3">
                    <span>Nội dung</span>
                    <strong>{paymentInfo.content}</strong>
                  </p>
                  <p className="small text-danger text-center mb-0">
                    Vui lòng chuyển đúng số tiền và nội dung. Đơn hàng sẽ được
                    xử lý sau khi admin xác nhận giao dịch.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center">
                <h1 className="display-1 mb-4">✓</h1>
                <h6 className="font-weight-bold mb-2">
                  Cửa hàng đang chuẩn bị đơn hàng của bạn
                </h6>
                <p className="small text-muted">
                  Bạn có thể theo dõi các bước tiếp theo trong danh sách đơn hàng.
                </p>
              </div>
            )}

            <Link
              to="/my_order"
              className="btn rounded btn-primary btn-lg btn-block mt-4"
            >
              Theo dõi đơn hàng của tôi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
