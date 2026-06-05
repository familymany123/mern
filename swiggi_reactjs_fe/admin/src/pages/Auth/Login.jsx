import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/adminUtils";

const Login = () => {
  const userRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);
  const navigate = useNavigate();

  const auth = useAuth();
  useEffect(() => {
    if (auth.token) {
      navigate("/");
    }
  }, [auth, navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(user, pwd);
    try {
      const dt = await auth.loginAction({ username: user, password: pwd });
      
      console.log(dt);
      setUser("");
      setPwd("");
      return;
    } catch (err) {
      setErrMsg(err.message);
    }
  };
  const handleUserInput = (e) => setUser(e.target.value);

  const handlePwdInput = (e) => setPwd(e.target.value);

  return (
    <div className="hold-transition login-page">
      <div className="login-box">
        <div className="card card-outline card-primary">
          <div className="card-header text-center">
            <Link to={"/"} className="h1">
              <b>ADMIN</b>
            </Link>
          </div>
          <div className="card-body">
            <p className="login-box-msg">Sign in to start your session</p>

            <form onSubmit={handleSubmit}>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  ref={userRef}
                  value={user}
                  onChange={handleUserInput}
                  autoComplete="off"
                  name="username"
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-user"></span>
                  </div>
                </div>
              </div>
              <div className="input-group mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  name="password"
                  onChange={handlePwdInput}
                  value={pwd}
                  required
                />
                <div className="input-group-append">
                  <div className="input-group-text">
                    <span className="fas fa-lock"></span>
                  </div>
                </div>
              </div>
              {errMsg && <div className="alert alert-danger">{errMsg}</div>}
              <div className="row">
                <div className="col-8">
                  <div className="icheck-primary">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember Me</label>
                  </div>
                </div>

                <div className="col-4">
                  <button type="submit" className="btn btn-primary btn-block">
                    Sign In
                  </button>
                </div>
              </div>
            </form>

            <p className="mb-1">
              <a href="#">I forgot my password</a>
            </p>
            <p className="mb-0">
              <Link className="text-center" to={"/register"}>
                Register a new membership
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
