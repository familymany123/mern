import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "../../components";
import Spinner from "../../components/Spinner";
import {
  deleteBanner,
  fetchBanners,
  updateBanner,
} from "../../features/banner/bannerSlice";
import { fetchCategories } from "../../features/category/categorySlice";

const Banner = () => {
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const { banners, status, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.banners);
  const { categories } = useSelector((state) => state.category);

  // Lấy dữ liệu banner và category chỉ một lần khi component mount
  useEffect(() => {
    dispatch(fetchBanners({ page: currentPage, limit: 10 }));
    dispatch(fetchCategories({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

  const handlePageChange = (page) => {
    dispatch(fetchBanners({ page, limit: 10 }));
  };
 
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  let filteredBanners = [];
  if (banners.length > 0) {
    filteredBanners = banners.filter((banner) =>
      banner?.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setBannerToDelete(null);
    setShowModal(false);
  };

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

  const handleConfirmDelete = () => {
    dispatch(deleteBanner(bannerToDelete)).then(() => {
      // Sau khi xóa, gọi lại để lấy dữ liệu mới
      dispatch(fetchBanners({ page: currentPage, limit: 10 }));
    });
    setShowDeleteModal(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(updateBanner(formData)).then(() => {
      // Sau khi cập nhật, gọi lại để lấy dữ liệu mới
      dispatch(fetchBanners({ page: currentPage, limit: 10 }));
    });
    handleCloseModal();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdateClick = (banner) => {
    setFormData(banner);
    setImagePreview(banner.image);
    setShowModal(true);
  };

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
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Banner</h3>
              <div className="card-tools">
                <div className="input-group input-group-sm" style={{ width: "200px" }}>
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
                    <th>Ảnh</th>
                    <th>Danh mục</th>
                    <th>Hiển thị</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map((banner, index) => (
                    <tr key={banner._id}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={banner?.image}
                          alt={banner?.category?.name}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                          }}
                        />
                      </td>
                      <td>{banner?.category?.name}</td>
                      <td>{banner?.show ? "Yes" : "No"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleUpdateClick(banner)}
                        >
                          <i className="fas fa-edit" aria-hidden="true"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => {
                            setShowDeleteModal(true);
                            setBannerToDelete(banner?._id);
                          }}
                          title="Xóa"
                        >
                          <i className="fas fa-trash" aria-hidden="true"></i>
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
                  className={`page-item ${index + 1 === currentPage ? "active" : ""}`}
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
            <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Sửa banner</h5>
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
                        <label htmlFor="show">Hiển thị</label>
                        <select
                          className="form-control select2"
                          id="show"
                          name="show"
                          value={formData.show}
                          onChange={handleFormChange}
                        >
                          <option value={true}>Hiển thị</option>
                          <option value={false}>Ẩn</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="categorySlug">Danh mục</label>
                        <select
                          className="form-control select2"
                          id="category"
                          value={formData.category._id}
                          onChange={handleChange}
                        >
                          <option value="" disabled>
                            Select Category
                          </option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="categoryImage">Hình ảnh</label>
                        <div className="input-group">
                          <div className="custom-file">
                            <input
                              type="file"
                              className="custom-file-input"
                              id="image"
                              name="image"
                              onChange={handleImageChange}
                            />
                            <label className="custom-file-label" htmlFor="categoryImage">
                              Choose file
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
                        Đóng
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
            itemName={"Banner"}
          />
        </div>
      </div>
    </div>
  );
};

export default Banner;
