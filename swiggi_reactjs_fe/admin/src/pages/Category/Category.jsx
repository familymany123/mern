import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDeleteModal } from "../../components";
import Spinner from "../../components/Spinner";
import {
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../features/category/categorySlice";

const Category = () => {
  const dispatch = useDispatch();
  const { categories, status, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.category);
  const [searchQuery, setSearchQuery] = useState("");

  const [updatedImage, setUpdatedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [formData, setFormData] = useState({});
  useEffect(() => {
    dispatch(fetchCategories({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    dispatch(fetchCategories({ page, limit: 10 }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setUpdatedImage(file);
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    console.log(e.target.value);
  };

  const filteredCategories = categories.filter((category) =>
    category?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="text-center mt-5">Error: {error || "Server lỗi"}</div>
    );
  }
  const handleUpdateClick = (category) => {
    setFormData(category);
    setImagePreview(category.image);
    setShowModal(true);
  };

  const handleShowDeleteModal = (categoryId) => {
    setCouponToDelete(categoryId);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setCouponToDelete(null);
    setShowModal(false);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteCategory(couponToDelete));
    setShowDeleteModal(false);
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    dispatch(updateCategory(formData));
    handleCloseModal();
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Danh mục</h3>

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
              <table className="table ">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên</th>
                    <th>Slug</th>
                    <th>Ảnh</th>
                    <th>Ngày tạo</th>
                    <th>Ngày chỉnh </th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category, key) => (
                    <tr key={category?._id}>
                      <td>{key + 1}</td>
                      <td>{category?.name}</td>
                      <td>{category?.slug}</td>
                      {/* image here */}
                      <td>
                        <img
                          src={category?.image}
                          alt={category?.name}
                          style={{ width: "50px", height: "50px" }}
                        />
                      </td>

                      <td>
                        {new Date(category?.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(category?.updated_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm mr-2"
                          onClick={() => handleUpdateClick(category)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleShowDeleteModal(category?._id)}
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
          {showModal && (
            <div
              className="modal fade show"
              style={{ display: "block" }}
              tabIndex="-1"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Sửa danh mục</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowModal(false)}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <form onSubmit={handleFormSubmit}>
                    <div className="modal-body">
                      <div className="form-group">
                        <label htmlFor="categoryName">Tên danh mục</label>
                        <input
                          type="text"
                          className="form-control"
                          id="categoryName"
                          name="name"
                          value={formData.name || ""}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="categorySlug">Slug</label>
                        <input
                          type="text"
                          className="form-control"
                          id="categorySlug"
                          name="slug"
                          value={formData.slug || ""}
                          onChange={handleFormChange}
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
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        Hủy
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Lưu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          <ConfirmDeleteModal
            show={showDeleteModal}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
            itemName={"category"}
          />
        </div>
      </div>
    </div>
  );
};

export default Category;
