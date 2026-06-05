import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "../../components";
import {
  createProvince,
  deleteProvince,
  fetchProvinces,
  updateProvince,
} from "../../features/provinces/provinceSlice";

const Provinces = () => {
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedProvinces, setSelectedProvinces] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { provinces, loading, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.provinces);
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setShowModal(false);
  };
  const handleConfirmDelete = () => {
    dispatch(deleteProvince(selectedProvinces));
    setShowDeleteModal(false);
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProvince(formData));
    handleCloseModal();
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handlePageChange = (page) => {
    dispatch(fetchProvinces({ page, limit: 10 }));
  };
  useEffect(() => {
    dispatch(fetchProvinces({ page: currentPage, limit: 10 }));
  }, [dispatch, provinces, currentPage]);
  const filterProvinces = provinces.filter((pro) =>
    pro.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name != "") {
      dispatch(createProvince(formData));
    }
  };
 
 
  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Tỉnh</h3>

              <div className="card-tools">
                <div
                  className="input-group input-group-sm"
                  style={{
                    width: "200px",
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
            <div className="card-body  ">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label htmlFor="type">Tên</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12  mb-3">
                    <button className="btn btn-primary  ">Thêm</button>
                  </div>
                </div>
              </form>
              <div className="row">
                <div className="table-responsive p-0">
                  <table className="table ">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filterProvinces.map((pro, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{pro?.name}</td>
                          <td>
                            <button
                              className="btn btn-primary"
                              onClick={() => {
                                setShowModal(true);
                                setFormData(pro);
                              }}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => {
                                setShowDeleteModal(true);
                              
                                setSelectedProvinces(pro);
                              }}
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
                        <h5 className="modal-title">Chỉnh sửa Tỉnh</h5>
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
                            <label htmlFor="categoryName">Tên tỉnh</label>
                            <input
                              type="text"
                              className="form-control"
                              id="categoryName"
                              name="name"
                              value={formData.name || ""}
                              onChange={handleFormChange}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowModal(false)}
                          >
                            Close
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
                itemName={"Proinvces"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Provinces;
