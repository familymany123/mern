import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../features/auth/authApiSlice";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { registerSuccess, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };
  useEffect(() => {
    if (registerSuccess) {
      navigate("/login");
    }
  }, [navigate, registerSuccess]);

   

  return (
    <>
      <div className="px-5 col-10 mx-auto">
        <h2 className="text-dark my-0">Xin chào</h2>
        <p className="text-50">Tiếp tục đăng ký</p>
        <form className="mt-5 mb-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="fullname" className="text-dark">
              Tên
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              className="form-control"
              id="fullname"
              aria-describedby="nameHelp"
              {...register("fullname", {
                required: "Vui lòng nhập tên",
              })}
            />
            {errors.name && (
              <span className="error-message">{errors.name.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="address" className="text-dark">
              Address
            </label>
            <input
              type="text"
              placeholder="Enter Address"
              className="form-control"
              id="address"
              aria-describedby="numberHelp"
              {...register("address", {
                required: "Vui lòng nhập địa chỉ",
              })}
            />
            {errors.address && (
              <span className="error-message">{errors.address.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="email" className="text-dark">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="form-control"
              id="email"
              aria-describedby="numberHelp"
              {...register("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Vui lòng nhập email hợp lệ",
                },
              })}
            />
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="username" className="text-dark">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              className="form-control"
              id="username"
              aria-describedby="numberHelp"
              {...register("username", {
                required: "Vui lòng nhập username",
              })}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="phone" className="text-dark">
              Phone
            </label>
            <input
              type="text"
              placeholder="Enter Mobile"
              className="form-control"
              id="phone"
              aria-describedby="numberHelp"
              {...register("phone", {
                required: "Vui lòng nhập số điện thoại",
                pattern: {
                  value: /^[0-9\b]+$/,
                  message: "Vui lòng nhập số điện thoại hợp lệ",
                },
              })}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone.message}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password" className="text-dark">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="form-control"
              id="password"
              {...register("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: 6,
              })}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>
          <button className="btn btn-primary btn-lg btn-block" type="submit">
            Đăng ký
          </button>
          <div className="py-2">
            <button className="btn btn-facebook btn-lg btn-block">
              <i className="feather-facebook"></i> Đăng ký với Facebook
            </button>
          </div>
        </form>
      </div>
      <div className="new-acc d-flex align-items-center justify-content-center">
        <Link to="/login">
          <p className="text-center m-0">Bạn đã có tài khoản? Đăng nhập</p>
        </Link>
      </div>
    </>
  );
};

export default Signup;
