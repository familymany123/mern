module.exports = {
    vnp_TmnCode: 'OI9R8P1J', // Mã TMN do VNPay cung cấp
    vnp_HashSecret: 'P4A2JY77QBZ8AY1W2KV0I09BHV1DMFCW', // Mã bí mật
    vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // URL thanh toán
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'https://swiggi-customer.vercel.app/checkout'
};
