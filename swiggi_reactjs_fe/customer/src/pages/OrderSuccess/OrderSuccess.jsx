import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import baseApi from "../../api/baseApi";
import { clearCart } from "../../features/cart/cartSlice";
import { resetOrder } from "../../features/order/orderSlice";
import { formatMoney } from "../../utils/formatMoney";

const LAST_VIETQR_ORDER_KEY = "lastVietQrOrder";

function readStoredResult() {
  try {
    return JSON.parse(sessionStorage.getItem(LAST_VIETQR_ORDER_KEY));
  } catch {
    sessionStorage.removeItem(LAST_VIETQR_ORDER_KEY);
    return null;
  }
}

function secondsUntil(expiresAt) {
  if (!expiresAt) return 0;
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)
  );
}

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

function OrderSuccess() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const momoOrderId = searchParams.get("orderId");
  const [result, setResult] = useState(() => location.state || readStoredResult());
  const order = result?.order;
  const paymentInfo = result?.paymentInfo;
  const isVietQrPayment = paymentInfo?.provider === "VietQR";
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    secondsUntil(paymentInfo?.expiresAt)
  );
  const [isExpired, setIsExpired] = useState(
    Boolean(paymentInfo?.expiresAt) && secondsUntil(paymentInfo.expiresAt) === 0
  );
  const expiryRequestSent = useRef(false);

  useEffect(() => {
    dispatch(resetOrder());
    dispatch(clearCart());
  }, [dispatch]);

  useEffect(() => {
    if (!momoOrderId || result?.order) return undefined;

    const fetchMomoOrder = async () => {
      try {
        const response = await baseApi.get(`/orders/${momoOrderId}`);
        setResult({ order: response.data.order });
      } catch (error) {
        console.error("Không thể lấy đơn hàng MoMo", error);
      }
    };

    fetchMomoOrder();
  }, [momoOrderId, result?.order]);

  useEffect(() => {
    if (!order?._id || !isVietQrPayment) return undefined;

    const checkOrder = async () => {
      try {
        const response = await baseApi.get(`/orders/${order._id}`);
        const updatedOrder = response.data.order;

        if (
          updatedOrder.paymentStatus === "Paid" ||
          updatedOrder.status === "Processing" ||
          updatedOrder.status === "Completed"
        ) {
          sessionStorage.removeItem(LAST_VIETQR_ORDER_KEY);
          navigate("/my_order", { replace: true });
        } else if (
          updatedOrder.paymentStatus === "Expired" ||
          updatedOrder.status === "Cancelled"
        ) {
          setIsExpired(true);
          setRemainingSeconds(0);
          sessionStorage.removeItem(LAST_VIETQR_ORDER_KEY);
        }
      } catch (error) {
        console.error("Không thể kiểm tra trạng thái thanh toán", error);
      }
    };

    checkOrder();
    const pollingId = window.setInterval(checkOrder, 3000);
    return () => window.clearInterval(pollingId);
  }, [navigate, order?._id, isVietQrPayment]);

  useEffect(() => {
    if (
      !order?._id ||
      order.payment !== "Momo" ||
      order.paymentStatus !== "Pending"
    ) {
      return undefined;
    }

    const checkMomoOrder = async () => {
      try {
        const response = await baseApi.get(`/orders/${order._id}`);
        const updatedOrder = response.data.order;
        setResult((current) => ({
          ...current,
          order: updatedOrder,
        }));

        if (
          updatedOrder.paymentStatus === "Paid" ||
          updatedOrder.status === "Cancelled"
        ) {
          sessionStorage.removeItem(LAST_VIETQR_ORDER_KEY);
        }
      } catch (error) {
        console.error("Không thể kiểm tra trạng thái MoMo", error);
      }
    };

    checkMomoOrder();
    const pollingId = window.setInterval(checkMomoOrder, 3000);
    return () => window.clearInterval(pollingId);
  }, [order?._id, order?.payment, order?.paymentStatus]);

  useEffect(() => {
    if (!order?._id || !paymentInfo?.expiresAt || isExpired) return undefined;

    const updateCountdown = async () => {
      const seconds = secondsUntil(paymentInfo.expiresAt);
      setRemainingSeconds(seconds);

      if (seconds === 0 && !expiryRequestSent.current) {
        expiryRequestSent.current = true;
        setIsExpired(true);
        sessionStorage.removeItem(LAST_VIETQR_ORDER_KEY);

        try {
          await baseApi.patch(`/orders/${order._id}/expire-payment`);
        } catch (error) {
          console.error("Không thể cập nhật hạn thanh toán", error);
        }
      }
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [isExpired, order?._id, paymentInfo?.expiresAt]);

  const isMomoOrder = order?.payment === "Momo";
  const pageTitle = isExpired
    ? "Mã VietQR đã hết hạn"
    : isVietQrPayment
    ? "Quét mã VietQR để chuyển khoản"
    : isMomoOrder && order?.paymentStatus === "Paid"
    ? "Thanh toán MoMo thành công"
    : isMomoOrder && order?.status === "Cancelled"
    ? "Thanh toán MoMo không thành công"
    : isMomoOrder
    ? "Đang kiểm tra thanh toán MoMo"
    : "Đơn hàng đã được tiếp nhận";

  return (
    <div className="py-5 osahan-coming-soon">
      <div className="container">
        <div className="mx-auto" style={{ maxWidth: "620px" }}>
          <div className="text-center pb-3">
            <h2 className="font-weight-bold">{pageTitle}</h2>
            <p className="text-muted mb-0">
              Mã đơn hàng: <strong>{order?.code || "Đang cập nhật"}</strong>
            </p>
          </div>

          <div className="bg-white rounded p-4 shadow-sm">
            {isVietQrPayment && !isExpired ? (
              <>
                <div className="text-center">
                  <p className="mb-2">Thời gian thanh toán còn lại</p>
                  <h3 className="font-weight-bold text-danger mb-3">
                    {formatCountdown(remainingSeconds)}
                  </h3>
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
                    Vui lòng chuyển đúng số tiền và nội dung. Trang sẽ tự chuyển
                    sang đơn hàng của bạn sau khi cửa hàng xác nhận giao dịch.
                  </p>
                </div>
              </>
            ) : isVietQrPayment ? (
              <div className="text-center py-4">
                <h5 className="font-weight-bold text-danger">
                  Đã quá 10 phút thanh toán
                </h5>
                <p className="text-muted mb-0">
                  Mã QR không còn hiệu lực và đơn hàng đã được hủy.
                </p>
              </div>
            ) : isMomoOrder ? (
              <div className="text-center">
                <h1 className="display-1 mb-4">
                  {order?.paymentStatus === "Paid" ? "✓" : "..."}
                </h1>
                <h6 className="font-weight-bold mb-2">
                  {order?.paymentStatus === "Paid"
                    ? "MoMo đã xác nhận giao dịch thành công"
                    : order?.status === "Cancelled"
                    ? "Giao dịch MoMo chưa hoàn tất"
                    : "Hệ thống đang chờ MoMo xác nhận giao dịch"}
                </h6>
                <p className="small text-muted">
                  Sau khi thanh toán thành công, bạn có thể theo dõi đơn hàng trong danh sách đơn hàng.
                </p>
              </div>
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
