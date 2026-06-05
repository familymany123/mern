import React from "react";

const AddUser = () => {
  const [formData, setFormData] = React.useState({
    username: "",
    fullname: "",
    phone: "",
    email: "",
    password: "",
    role: "",
    address: "",
  });
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSuccessMessage("User added successfully.");
      console.log(formData);
    }
  };
  const validateForm = () => {
    if (
      !formData.username ||
      !formData.fullname ||
      !formData.email ||
      !formData.password ||
      !formData.address ||
      !formData.phone ||
      !formData.role
    ) {
      setErrorMessage("All fields are required.");
      return false;
    }
    return true;
  };
  return (
    <section className="content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="card card-primary">
              <div className="card-header">
                <h3 className="card-title">Thêm người dùng</h3>
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
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      className="form-control"
                       
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {/* fullname and phone */}
                  <div className="form-group">
                    <label htmlFor="fullname">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="fullname"
                      value={formData.fullname}
                      onChange={handleChange}
                      required
                    />
                  </div>

                   
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select
                      className="form-control"
                      id="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                  {/* address */}
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <textarea
                      className="form-control"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}
                  {successMessage && (
                    <div className="alert alert-success" role="alert">
                      {successMessage}
                    </div>
                  )}
                </div>
                <div className="card-footer">
                  <button type="submit" className="btn btn-success float-right">
                    Create User
                  </button>
                  <a href="#" className="btn btn-secondary">
                    Cancel
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

export default AddUser;
