import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import slugify from "slugify";
import { fetchCategories } from "../../features/category/categorySlice";
import { createFood } from "../../features/foods/foodSlice";

const AddFood = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    slug: "",
    cooking_time: "",
    type: "",
    show: false,
  });
  const { categories, status, currentPage, totalPages, next, prev } =
    useSelector((state) => state.category);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { error } = useSelector((state) => state.foods);
  useEffect(() => {
    dispatch(fetchCategories({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const filteredCategories = categories;

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "image" && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({
        ...prevData,
        [id]: file,
      }));
      setImagePreview(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      slug: slugify(newName, { lower: true }),
    });
  };
  const validateForm = () => {
    if (
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.slug ||
      !formData.cooking_time ||
      !formData.type
    ) {
      setErrorMessage("All fields are required.");
      return false;
    }
    if (formData.price <= 0 || formData.cooking_time <= 0) {
      setErrorMessage("Price and Cooking Time must be greater than zero.");

      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setErrorMessage("");
      dispatch(createFood(formData));
      console.log(formData);
    }
  };
  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Thêm thức ăn</h3>
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
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="slug">Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      id="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Giá</label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      value={formData.price}
                      required
                      onChange={handleChange}
                    />
                  </div>

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
                          Chọn ảnh
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
                  {/* select category */}
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
                    <label htmlFor="cooking_time">Thời gian nấu</label>
                    <input
                      type="text"
                      className="form-control"
                      id="cooking_time"
                      value={formData.cooking_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="type">Loại</label>
                    <input
                      type="text"
                      className="form-control"
                      id="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    />
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
                  <div className="form-group">
                    <label htmlFor="description">Thông tin</label>
                    <textarea
                      className="form-control"
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  {errorMessage ||
                    (error && (
                      <div className="alert alert-danger" role="alert">
                        {errorMessage || error}
                      </div>
                    ))}
                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <button type="submit" className="btn btn-success float-right">
                    Thêm
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

export default AddFood;
