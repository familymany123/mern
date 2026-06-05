import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import slugify from "slugify";
import Spinner from "../../components/Spinner";
import { createCategory } from "../../features/category/categorySlice";

const AddCategory = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.category);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newCategoryData = new FormData();
    newCategoryData.append("name", formData.name);
    newCategoryData.append("slug", formData.slug);
    if (formData.image) {
      newCategoryData.append("image", formData.image);
    }
    dispatch(createCategory(newCategoryData));
    setFormData({ name: "", slug: "", image: null });
  };
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData({
      ...formData,
      name: newName,
      slug: slugify(newName, { lower: true }),
    });
  };
  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Thêm danh mục</h3>
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
              {status === "loading" && <Spinner />}
              {status === "failed" && (
                <div className="alert alert-danger">{error}</div>
              )}
              <form onSubmit={handleFormSubmit}>
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="categoryName">Tên danh mục</label>
                    <input
                      type="text"
                      className="form-control"
                      id="categoryName"
                      name="name"
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="categorySlug">Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      id="categorySlug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="categoryImage">Ảnh</label>
                   
                    <div className="input-group">
                      <div className="custom-file">
                        <input
                          type="file"
                          className="custom-file-input"
                          id="categoryImage"
                          name="image"
                          onChange={handleImageChange}
                        />
                        <label
                          className="custom-file-label"
                          htmlFor="categoryImage"
                        >
                          Chọn ảnh
                        </label>
                      </div>
                    </div>

                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Category Preview"
                        width="100"
                        className="mt-2"
                      />
                    )}
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

export default AddCategory;
