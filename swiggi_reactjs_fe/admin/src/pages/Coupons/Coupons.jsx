import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "../../components/Spinner";
import {
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
} from "../../features/coupons/couponSlice";

const Coupons = () => {
  const dispatch = useDispatch();
  const { coupons, currentPage, totalPages, status, error, next, prev } =
    useSelector((state) => state.coupons);

  const [showModal, setShowModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCoupons({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    dispatch(fetchCoupons({ page, limit: 10 }));
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon?.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === "loading") {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Spinner />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="text-center mt-5  ">Error: {error || "Server lỗi"}</div>
    );
  }
  const handleUpdateClick = (coupon) => {
    console.log(coupon);
    setSelectedCoupon(coupon);
    setFormData(coupon);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCoupon(null);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(updateCoupon(formData));
    handleCloseModal();
  };

  const handleShowDeleteModal = (couponId) => {
    setCouponToDelete(couponId);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = () => {
    dispatch(deleteCoupon(couponToDelete));
    setShowDeleteModal(false);
  };
  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Mã giảm giá</h3>

              <div className="card-tools">
                <div
                  className="input-group input-group-sm"
                  style={{
                    width: "150px",
                  }}
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
            </div>
            <div className="card-body table-responsive p-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mã</th>
                    <th>Giá trị(%)</th>
                    <th>Số lượng</th>
                    <th>Ngày hết hạn</th>
                    <th>Ngày tạo</th>
                    <th>Ngày chỉnh </th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon, key) => (
                    <tr key={coupon?._id}>
                      <td>{key + 1}</td>
                      <td>{coupon?.code}</td>
                      <td>{coupon?.value}%</td>
                      <td>{coupon?.quantity}</td>
                      <td>
                        {new Date(coupon?.expiry_date).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(coupon?.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(coupon?.updated_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm mr-2"
                          onClick={() => handleUpdateClick(coupon)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleShowDeleteModal(coupon?._id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <nav>
            <ul className="pagination">
              <li className={`page-item ${!prev ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!prev}
                >
                  Prev
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    index + 1 === currentPage ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${!next ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!next}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
          {showDeleteModal && (
            <div
              className="modal fade show"
              style={{ display: "block" }}
              tabIndex="-1"
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Xác nhận xóa</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowDeleteModal(false)}
                      aria-label="Close"
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>Bạn có chắc chắn muốn xóa phiếu giảm giá này</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleConfirmDelete}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Modal for updating coupon */}
          {/* Modal for updating coupon */}
          <div
            className={`modal fade ${showModal ? "show" : ""}`}
            style={{ display: showModal ? "block" : "none" }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa mã giảm giá</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleFormSubmit}>
                    <div className="form-group">
                      <label htmlFor="couponCode">Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="couponCode"
                        name="code"
                        value={formData.code || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="couponDescription">Thông tin</label>
                      <input
                        type="text"
                        className="form-control"
                        id="couponDescription"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="couponValue">Giá trị (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="couponValue"
                        name="value"
                        value={formData.value || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="couponQuantity">Số lượng</label>
                      <input
                        type="number"
                        className="form-control"
                        id="couponQuantity"
                        name="quantity"
                        value={formData.quantity || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="couponExpiryDate">Ngày hết hạn</label>
                      <input
                        type="date"
                        className="form-control"
                        id="couponExpiryDate"
                        name="expiry_date"
                        value={
                          formData.expiry_date
                            ? formData.expiry_date.split("T")[0]
                            : ""
                        }
                        onChange={handleFormChange}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Lưu
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
