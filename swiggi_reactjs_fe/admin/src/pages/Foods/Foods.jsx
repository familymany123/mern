import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "../../components";
import Spinner from "../../components/Spinner";
import { fetchCategories } from "../../features/category/categorySlice";
import {
  deleteFood,
  fetchFoods,
  updateFood,
} from "../../features/foods/foodSlice";
import { formatMoney } from "../../utils/formatMoney";

const Foods = () => {
  const dispatch = useDispatch();
  const { foods, currentPage, totalPages, status, error, next, prev } =
    useSelector((state) => state.foods);
  const [updatedImage, setUpdatedImage] = useState(null);
  const { categories } = useSelector((state) => state.category);

  const [showModal, setShowModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const navigator = useNavigate();

  useEffect(() => {
    dispatch(fetchFoods({ page: currentPage, limit: 10 }));
    dispatch(fetchCategories({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    dispatch(fetchFoods({ page, limit: 10 }));
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    setUpdatedImage(file);
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
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
  const handleUpdateClick = (food) => {
    setSelectedFood(food);
    setImagePreview(food.image);
    setFormData({
      ...food,
      category: food?.category?._id || food?.category || "",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFood(null);
    setShowDeleteModal(false);
    setFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleChange = (e) => {
    console.log(e.target.value);
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }
  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    dispatch(updateFood(formData));
    handleCloseModal();
  };

  const handleShowDeleteModal = (foodId) => {
    setFoodToDelete(foodId);
    setShowDeleteModal(true);
  };
  const handleConfirmDelete = () => {
    dispatch(deleteFood(foodToDelete));
    setShowDeleteModal(false);
  };

  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Food</h3>

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
                    <th>Tên</th>
                    <th>Giá</th>
                    <th>Ảnh</th>
                    <th>Slug</th>
                    <th>Thời gian nấu</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((food, key) => (
                    <tr key={food?._id}>
                      <td>{key + 1}</td>
                      <td>{food?.name}</td>
                      <td>{formatMoney(food?.price)}</td>

                      <td>
                        <img
                          src={food?.image}
                          alt={food?.name}
                          style={{ width: "150px", height: "150px" }}
                        />
                      </td>
                      <td>{food?.slug}</td>
                      <td>{food?.cooking_time}</td>

                      <td>
                        <button
                          className="btn btn-warning btn-sm mr-2"
                          onClick={() => handleUpdateClick(food)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleShowDeleteModal(food?._id)}
                        >
                          Xóa
                        </button>
                        {/* button infor */}
                        <button
                          className="btn btn-info btn-sm ml-2"
                          onClick={() =>
                            navigator("/food-topping", {
                              state: { foodId: food?._id },
                            })
                          }
                        >
                          <i className="nav-icon fas fa-info"></i>
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
                  aria-label="Previous"
                >
                  <span aria-hidden="true">Prev</span>
                </button>
              </li>

              {currentPage > 2 && (
                <>
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(1)}>
                      1
                    </button>
                  </li>
                  {currentPage > 3 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                </>
              )}

              {/* Trang hiện tại và các trang xung quanh */}
              {Array.from({ length: 3 }, (_, i) => {
                const pageNumber = currentPage - 1 + i;
                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <li
                      key={pageNumber}
                      className={`page-item ${
                        pageNumber === currentPage ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && (
                    <li className="page-item disabled">
                      <span className="page-link">...</span>
                    </li>
                  )}
                  <li className="page-item">
                    <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                      {totalPages}
                    </button>
                  </li>
                </>
              )}

              <li className={`page-item ${!next ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!next}
                  aria-label="Next"
                >
                  <span aria-hidden="true">Next</span>
                </button>
              </li>
            </ul>
          </nav>

          <div
            className={`modal fade ${showModal ? "show" : ""}`}
            style={{ display: showModal ? "block" : "none" }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog  " role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa món ăn</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleCloseModal}
                    aria-label="Close"
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div
                  className="modal-body  "
                  style={{
                    overflowY: "auto",
                    height: "500px",
                  }}
                >
                  <form onSubmit={handleFormSubmit} className="">
                    <div className="form-group">
                      <label htmlFor="foodName">Tên</label>
                      <input
                        type="text"
                        className="form-control"
                        id="foodName"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="foodPrice">Giá</label>
                      <input
                        type="number"
                        className="form-control"
                        id="foodPrice"
                        name="price"
                        value={formData.price || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="foodSlug">Slug</label>
                      <input
                        type="text"
                        className="form-control"
                        id="foodSlug"
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="foodDes">Mô tả</label>
                      <textarea
                        className="form-control"
                        id="foodDes"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleFormChange}
                        rows="4"
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label htmlFor="foodCategory">Danh mục</label>
                      <select
                          className="form-control select2"
                          id="category"
                          name="category"
                          value={formData?.category || ""}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select Category
                          </option>
                          {categories.map((category) => (
                            <option key={category?._id} value={category?._id}>
                              {category?.name}
                            </option>
                          ))}
                        </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="foodsType">Loại</label>
                      <input
                        type="text"
                        className="form-control"
                        id="foodsType"
                        name="type"
                        value={formData?.type || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="foodsCookingTime">Thời gian nấu</label>
                      <input
                        type="text"
                        className="form-control"
                        id="foodsCookingTime"
                        name="cooking_time"
                        value={formData.cooking_time || ""}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="foodsImage">Ảnh</label>

                      <div className="input-group">
                        <div className="custom-file">
                          <input
                            type="file"
                            className="custom-file-input"
                            id="foodsImage"
                            name="image"
                            onChange={handleImageChange}
                          />
                          <label
                            className="custom-file-label"
                            htmlFor="foodsImage"
                          >
                            Chọn ảnh
                          </label>
                        </div>
                      </div>

                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Food Review"
                          width="100"
                          className="mt-2"
                        />
                      )}
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
          </div>
          <ConfirmDeleteModal
            show={showDeleteModal}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
            itemName={"Foods"}
          />
        </div>
      </div>
    </div>
  );
};

export default Foods;
