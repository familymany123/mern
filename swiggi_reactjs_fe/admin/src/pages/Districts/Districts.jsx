import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ConfirmDeleteModal } from "../../components";
import {
  createDistrict,
  deleteDistrict,
  fetchDistrict,
  updateDistrict,
} from "../../features/district/districtSlice";
import { fetchProvinces } from "../../features/provinces/provinceSlice";

const Districts = () => {
  const dispatch = useDispatch();
  const navigator = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    province: "",
    id: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [districtToDelete, setDitrictoDelete] = useState();
  const { provinces } = useSelector((state) => state.provinces);
  const { districts, status, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.districts);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  useEffect(() => {
    dispatch(fetchDistrict({ page: currentPage, limit: 10 }));
  }, [currentPage, dispatch, districts]);
  useEffect(() => {
    dispatch(fetchProvinces({ page: 1, limit: 10 }));
  }, [dispatch, provinces]);
  const filteredDistricts = districts.filter((district) =>
    district?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDitrictoDelete(null);
    setShowModal(false);
  };
  const handleConfirmDelete = () => {
    dispatch(deleteDistrict(districtToDelete));
    setShowDeleteModal(false);
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handlePageChange = (page) => {
    dispatch(fetchDistrict({ page, limit: 10 }));
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(updateDistrict(formData));
    handleCloseModal();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name != "" || formData.provice != "") {
      dispatch(createDistrict(formData));
    }
  };
  useEffect(() => {
    if (error) {
      toast.error("" + error.message);
    }
  }, [error]);
  const handleUpdateClick = (data) => {
    setFormData({
      id: data._id,
      name: data?.name,
      province: data?.province?._id,
    });
    setShowModal(true);
  };

  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Thành phố</h3>

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
            <div className="card-body ">
              {/* add districs here  */}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-6">
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
                  <div className="col-6">
                    <div className="form-group">
                      <label htmlFor="type">Thuộc tỉnh</label>
                      <select
                        className="form-control select2"
                        id="category"
                        value={formData.province || ""}
                        name="province"
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Chọn tỉnh
                        </option>
                        {provinces.map((category) => (
                          <option key={category?._id} value={category?._id}>
                            {category?.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-12  mb-3">
                    <button className="btn btn-primary  " type="submit">
                      Thêm
                    </button>
                  </div>
                </div>
              </form>
              <div className="row table-responsive p-0">
                <table className="table">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Tên</th>
                      <th>Thuộc tỉnh</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistricts.map((district, index) => (
                      <tr key={district?._id}>
                        <td>{index + 1}</td>
                        <td>{district?.name}</td>
                        <td>{district?.province?.name || ""}</td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              handleUpdateClick(district);
                            }}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setShowDeleteModal(true);
                              setDitrictoDelete(district);
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
                      <h5 className="modal-title">Sửa thành phố</h5>
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
                          <label htmlFor="categoryName">Tên thành phố</label>
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
                          <label htmlFor="province">Tỉnh thành</label>
                          <select
                            className="form-control select2"
                            id="province"
                            value={formData?.province || ""}
                            name="province"
                            onChange={handleChange}
                          >
                            <option value="" disabled>
                              Chọn tỉnh
                            </option>
                            {provinces.map((pro) => (
                              <option key={pro._id} value={pro._id}>
                                {pro.name}
                              </option>
                            ))}
                          </select>
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
              itemName={"District"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Districts;
