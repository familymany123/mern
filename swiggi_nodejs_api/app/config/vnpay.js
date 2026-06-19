module.exports = {
    vnp_TmnCode: process.env.VNP_TMN_CODE?.trim(),
    vnp_HashSecret: process.env.VNP_HASH_SECRET?.trim(),
    vnp_Url: process.env.VNP_URL?.trim() || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: process.env.VNP_RETURN_URL?.trim() || 'https://swiggi-fastfood-sang.vercel.app/checkout'
};
