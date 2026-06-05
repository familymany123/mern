import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createTopping } from "../../features/topping/toppingSlice";

const AddTopping = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });
  const dispatch = useDispatch();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log(formData);
      dispatch(createTopping(formData));
      setErrorMessage("");
      setSuccessMessage("Topping created successfully.");
      setFormData({
        name: "",
        price: "",
      });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };
  const validateForm = () => {
    if (!formData.name || !formData.price) {
      setErrorMessage("All fields are required.");
      return false;
    }
    if (formData.price <= 0) {
      setErrorMessage("Price must be greater than zero.");
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
                <h3 className="card-title">Thêm topping</h3>
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
                  <div className="form-group">
                    <label htmlFor="name">Tên</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Enter name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price">Giá</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={handleChange}
                    />
                  </div>
 
                </div>
                <div className="card-footer">
                  <button type="submit" className="btn btn-success float-right">
                    Thêm
                  </button>
                  <input type="reset" className="btn btn-secondary" value="Làm lại" />
                   
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddTopping;
