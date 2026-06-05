import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDeleteModal } from "../../components";
import Spinner from "../../components/Spinner";
import {
  deleteTopping,
  fetchToppings,
  updateTopping,
} from "../../features/topping/toppingSlice";
import { formatMoney } from "../../utils/formatMoney";

const Topping = () => {
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toppingToDelete, setToppingToDelete] = useState(null);

  const { toppings, status, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.toppings);

  // data
  const filteredToppings = toppings.filter((topping) =>
    topping.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // function

  const handlePageChange = (page) => {
    dispatch(fetchToppings({ page, limit: 10 }));
  };
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const handleShowModal = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleConfirmDelete = () => {
    dispatch(deleteTopping(toppingToDelete));
    setShowDeleteModal(false);
  };
  const handleShowDeleteModal = (id) => {
    setToppingToDelete(id);
    setShowDeleteModal(true);
  };
  const handleUpdateClick = (topping) => {
    setFormData(topping);
    console.log(topping);
    setShowModal(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    dispatch(updateTopping(formData));
    setShowModal(false);
  };
  //  render
  useEffect(() => {
    dispatch(fetchToppings({ page: currentPage, limit: 10 }));
  }, [dispatch, currentPage]);

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

  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Topping</h3>

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
            <div className="card-body table-responsive p--0">
              <table className="table">
                {/* table header */}
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tên</th>
                    <th>Giá</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                {/* table body */}
                <tbody>
                  {filteredToppings.map((topping, index) => (
                    <tr key={topping?._id}>
                      <td>{index + 1}</td>
                      <td>{topping?.name}</td>
                      <td>{formatMoney(topping?.price)}</td>
                      <td>
                        <button
                          className="btn btn-primary"
                          onClick={() => handleUpdateClick(topping)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-danger ml-2"
                          onClick={() => handleShowDeleteModal(topping?._id)}
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
              {/* Previous Button */}
              <li className={`page-item ${!prev ? "disabled" : ""}`}>
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!prev}
                  aria-label="Previous"
                >
                  <span aria-hidden="true">&laquo; Prev</span>
                </button>
              </li>

              {/* Numbered Pages */}
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
                  <span aria-hidden="true">Next &raquo;</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Modal */}
          {showModal && (
            <div
              className="modal fade show"
              style={{ display: "block" }}
              tabIndex="-1"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Sửa Topping</h5>
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
                        <label>Tên</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          required
                          title="Hãy nhập tên"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label>Giá</label>
                        <input
                          type="number"
                          name="price"
                          title="Hãy nhập giá"
                          required
                          className="form-control"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                        />
                      </div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCloseModal}
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

export default Topping;
