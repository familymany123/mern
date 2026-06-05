import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBanner } from "../../features/banner/bannerSlice";
import { fetchCategories } from "../../features/category/categorySlice";

const AddBanner = () => {
  const dispatch = useDispatch();
  const { categories, status, currentPage, totalPages, next, prev } =
    useSelector((state) => state.category);
  const [imagePreview, setImagePreview] = useState(null);
  const filteredCategories = categories;
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    category: "",
    image: "",
    show: false,
  });
  const validateForm = () => {
    if (!formData.category || !formData.image) {
      setErrorMessage("All fields are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setErrorMessage("");
      dispatch(createBanner(formData));
      setFormData({
        category: "",
        image: "",
        show: false,
      });
    }
  };
  useEffect(() => {
    dispatch(fetchCategories({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);
  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "image" && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({
        ...prevData,
        [id]: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };
  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Thêm banner</h3>
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
                    <label htmlFor="image">Ảnh</label>

                    <div className="input-group">
                      <div className="custom-file">
                        <input
                          type="file"
                          className="custom-file-input"
                          required
                          id="image"
                          onChange={handleChange}
                        />
                        <label
                          className="custom-file-label"
                          htmlFor="exampleInputFile"
                        >
                          Chọn file
                        </label>
                      </div>
                    </div>

                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Food Preview"
                        width="100"
                        className="mt-2"
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Danh mục</label>
                    <select
                      className="form-control select2"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Chọn danh mục
                      </option>
                      {filteredCategories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="show">Hiển thị</label>
                    <input
                      type="checkbox"
                      className="form-control"
                      id="show"
                      value={formData.show}
                      onChange={(e) =>
                        setFormData((prevData) => ({
                          ...prevData,
                          show: e.target.checked,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="card-footer">
                  <button type="submit" className="btn btn-success float-right">
                    Thêm banner
                  </button>
                  <button type="reset" className="btn btn-secondary">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddBanner;
