import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { userLogin } from "../../features/auth/authApiSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    console.log(data)
    dispatch(userLogin(data));
  };
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="px-5 col-10 mx-auto">
      <h2 className="text-dark my-0">Chào mừng bạn trở lại ...</h2>
      <p className="text-50">Tiếp tục đăng nhập</p>
      <form className="mt-5 mb-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="username" className="text-dark">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            className="form-control"
            id="username"
            aria-describedby="usernameHelp"
            name="username"
            {...register("username", {
              required: "Vui lòng nhập username",
              minLength: 6,
             
            })}
          />
          {errors.username && (
            <span className="error-message">{errors.username.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1" className="text-dark">
            Mật khẩu
          </label>
          <input
            type="password"
            placeholder="Enter Password"
            className="form-control"
            id="exampleInputPassword1"
            name="password"
            {...register("password", {
              required: "Vui lòng nhập mật khẩu > 6",
              minLength: 6,
            })}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>
        <button className="btn btn-primary btn-lg btn-block" type="submit">
          Đăng nhập
        </button>
      </form>
     
      <div className="d-flex align-items-center justify-content-center">
        <Link to={"/sign-up"}>
          <p className="text-center m-0">Bạn chưa có tài khoản? Đăng ký</p>
        </Link>
      </div>
    </div>
  );
};

export default Login;
