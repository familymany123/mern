import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { resetOrder } from "../../features/order/orderSlice";

 
function OrderSuccess() {
    const dispatch = useDispatch();
  
    useEffect(() => {
        dispatch( resetOrder());
        dispatch( clearCart());
        
    }, []);
    return (
        <>
            <div className="d-none">
                <div className="bg-primary p-3 d-flex align-items-center">
                    <a className="toggle togglew toggle-2" href="#"><span></span></a>
                    <h4 className="font-weight-bold m-0 text-white">Thanks :)</h4>
                </div>
            </div>
            <div className="py-5 osahan-coming-soon d-flex justify-content-center align-items-center">
                <div className="col-md-6">
                    <div className="text-center pb-3">
                        <h1 className="font-weight-bold">Đơn hàng của bạn đã được thanh toán</h1>
                        <p>Kiểm tra trạng thái đơn hàng của bạn trong <a href="my_order" className="font-weight-bold text-decoration-none text-primary">Đơn hàng của tôi</a> để biết thông tin về các bước tiếp theo.</p>
                    </div>
                    {/* Continue */}
                    <div className="bg-white rounded text-center p-4 shadow-sm">
                        <h1 className="display-1 mb-4">🎉</h1>
                        <h6 className="font-weight-bold mb-2">Đang chuẩn bị đơn đặt hàng của bạn</h6>
                        <p className="small text-muted">Đơn hàng của bạn sẽ được chuẩn bị và sẽ đến sớm</p>
                        <a href="my_order" className="btn rounded btn-primary btn-lg btn-block">Theo dõi đơn hàng của tôi</a>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OrderSuccess;
