import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createCoupon } from '../../features/coupons/couponSlice';

const AddCoupon = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    value: '',
    quantity: '',
    expiry_date: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(createCoupon(formData))
        .then(() => {
           
          setErrorMessage('');
          setFormData({
            code: '',
            description: '',
            value: '',
            quantity: '',
            expiry_date: '',
          });
        })
        .catch((error) => {
          setErrorMessage('Failed to create coupon. Please try again.');
          setSuccessMessage('');
        });
    }
  };

  const validateForm = () => {
    if (!formData.code || !formData.description || !formData.value || !formData.quantity || !formData.expiry_date) {
      setErrorMessage('All fields are required.');
      return false;
    }
    if (formData.value <= 0 || formData.quantity <= 0) {
      setErrorMessage('Value and Quantity must be greater than zero.');
      return false;
    }
    return true;
  };

  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Thêm mã giảm giá</h3>
                <div className="card-tools">
                  <button
                    type="button"
                    className="btn btn-tool"
                    data-card-widget="collapse"
                    title="Collapse"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body">
                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="code">Code mã giảm giá</label>
                    <input
                      type="text"
                      id="code"
                      className="form-control"
                      value={formData.code}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description">Thông tin</label>
                    <textarea
                      id="description"
                      className="form-control"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="value">Giá trị chiết khấu (%)</label>
                    <input
                      type="number"
                      id="value"
                      className="form-control"
                      value={formData.value}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="quantity">Số lượng</label>
                    <input
                      type="number"
                      id="quantity"
                      className="form-control"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="expiry_date">Ngày hết hạn</label>
                    <input
                      type="date"
                      id="expiry_date"
                      className="form-control"
                      value={formData.expiry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="card-footer">
                  <button type="submit" className="btn btn-success float-right">
                    Tạo
                  </button>
                  <a href="#" className="btn btn-secondary">
                    Hủy
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddCoupon;