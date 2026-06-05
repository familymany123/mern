import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { VscArrowRight } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { userProfile, userUpdate } from "../../../features/user/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (token) {
      dispatch(userProfile(token));
    }
  }, [dispatch, token]);

  const {
    register,
    handleSubmit,
    setValue, // Import setValue to dynamically update form values
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Set form values dynamically after user data is fetched
    if (user) {
      setValue("fullname", user.fullname);
      setValue("phone", user.phone);
      setValue("email", user.email);
      setValue("address", user.address);
    }
  }, [user, setValue]);

  const onSubmit = (data) => {
    dispatch(userUpdate({ data }));
  };
  if (!token) {
    return (
      <div
        className=""
        style={{
          minHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          flexDirection: "column",
        }}
      >
        <h3> Vui lòng đăng nhập để tiếp tục</h3>
        <div className="new-acc d-flex align-items-center justify-content-center">
          <Link to={"/login"} className="btn btn-primary">
            Đăng nhập
          </Link>
          <Link to={"/faq"} className="btn btn-light">
            Trợ giúp
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h5 className="mb-4">Tài khoản của tôi</h5>
      <div id="edit_profile">
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="exampleInputName1">Tên</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputName1d"
                {...register("fullname", {
                  required: "Vui lòng nhập họ và tên",
                  minLength: {
                    value: 6,
                    message: "Tên phải có ít nhất 6 ký tự",
                  },
                })}
              />
              {errors.fullname && (
                <span className="error-message">{errors.fullname.message}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputName1">Địa chỉ</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputName1d"
                {...register("address", {
                  required: "Vui lòng địa chỉ",
                  minLength: {
                    value: 6,
                  },
                })}
              />
              {errors.address && (
                <span className="error-message">{errors.address.message}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputNumber1">Số điện thoại di động</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputNumber1"
                {...register("phone", {
                  required: "Vui lòng nhập số điện thoại",
                  pattern: {
                    value: /^\+?[0-9]{1,15}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                })}
              />
              {errors.phone && (
                <span className="error-message">{errors.phone.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="exampleInputEmail1">Email</label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                {...register("email", {
                  required: "Vui lòng nhập email",
                  pattern: {
                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputNumber1">Mật khẩu</label>
              <input
                type="text"
                className="form-control"
                id="exampleInputNumber1"
                {...register("password", {
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
              />
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-primary btn-block">
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
        <div className="additional">
          <div className="change_password my-3">
            <Link
              to="/forgot_password"
              className="p-3 border rounded bg-white btn d-flex"
            >
              Thay đổi mật khẩu
              <span className="ml-auto">
                <VscArrowRight />
              </span>
            </Link>
          </div>
          <div className="deactivate_account">
            <Link to="#" className="p-3 border rounded bg-white btn d-flex">
              Vô hiệu hóa tài khoản
              <span className="ml-auto">
                <VscArrowRight />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
