import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDeleteModal } from "../../components";
import Spinner from "../../components/Spinner";
import {
  blockUser,
  fetchUsers,
  updateUser,
} from "../../features/user/userSlice";

const Users = () => {
  const dispatch = useDispatch();
  const { users, status, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setShowDeleteModal(false);
  };
  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
  };
  const handleShowDeleteModal = (id) => {
    setShowDeleteModal(true);
  };
  const handleUpdateClick = (category) => {
    setFormData(category);
    console.log(category);
    setShowModal(true);
  };
  const handleToggle = (e) => {
    dispatch(blockUser(e.target.id));
  };
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handlePageChange = (page) => {
    dispatch(fetchUsers({ page, limit: 10 }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    dispatch(updateUser(formData));
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
  if (status === "failed") {
    return (
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <h1>{error || "Something went wrong..."}</h1>
      </div>
    );
  }
  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Người dùng</h3>

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
                {/* table header */}
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên người dùng</th>
                    <th>Email</th>
                    <th>Quyền</th>
                    <th>Số điện thoại</th>
                    <th>Hoạt động</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                {/* table body */}
                <tbody className="">
                  {filteredUsers.map((user, index) => (
                    <tr key={user?._id}>
                      <td>{index + 1}</td>
                      <td>{user?.username}</td>
                      <td>{user?.email}</td>
                      <td>{user?.role}</td>
                      <td>{user?.phone}</td>
                      <td>
                        <div className="custom-control custom-switch">
                          <input
                            type="checkbox"
                            className="custom-control-input"
                            value={user?.status}
                            checked={user?.status}
                            onChange={handleToggle}
                            id={user?._id}
                          />
                          <label
                            className="custom-control-label"
                            htmlFor={user?._id}
                          ></label>
                        </div>
                      </td>
                      <td>
                        <button type="button" className="btn">
                          <i className="fa fa-info" aria-hidden="true"></i>
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
              className={`modal fade ${showModal ? "show" : ""}`}
              style={{
                display: showModal ? "block" : "none",
              }}
              tabIndex={"-1"}
              role={"dialog"}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Sửa người dùng</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={handleCloseModal}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="username">Họ và tên</label>
                        <input
                          type="text"
                          className="form-control"
                          id="username"
                          value={formData.fullname}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullname: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <textarea
                          className="form-control"
                          id="address"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          required
                        ></textarea>
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
            </div>
          )}
          <ConfirmDeleteModal
            show={showDeleteModal}
            onClose={handleCloseModal}
            onConfirm={handleConfirmDelete}
            itemName={"User"}
          />
        </div>
      </div>
    </div>
  );
};

export default Users;
