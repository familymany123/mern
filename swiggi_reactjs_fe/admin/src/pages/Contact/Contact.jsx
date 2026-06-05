import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchContacts } from "../../features/contact/contactSlice";

const Contact = () => {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const [contactsOne, setContacts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  const { contacts, status, error, currentPage, totalPages, next, prev } =
    useSelector((state) => state.contacts);
  useEffect(() => {
    dispatch(fetchContacts({ page: currentPage, limit: 10 }));
  }, [currentPage, dispatch]);
  let filterContact = [];
  if (contacts.length > 0) {
    filterContact = contacts.filter((c) =>
      c?.user?.fullname?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
   
  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Liên hệ</h3>

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
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên</th>

                    <th>Phone</th>
                    <th>Nội dung</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {filterContact.map((contact, index) => (
                    <tr key={contact?._id}>
                      <td>{index + 1}</td>
                      <td>{contact?.user?.fullname}</td>
                      <td>{contact?.user?.phone}</td>
                      <td>{contact?.message}</td>
                       
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>{" "}
     
    </div>
  );
};

export default Contact;
