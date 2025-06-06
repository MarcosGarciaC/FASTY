import React, { useContext, useEffect, useState } from 'react';
import "./LoginPopUp.css";
import "https://kit.fontawesome.com/ce8be9cf0b.js";
import { StoreContext } from '../../context/StoreContext';
import axios from "axios"

const LoginPopUp = ({ setShowLogin }) => {

  const { url, setToken } = useContext(StoreContext)

  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role: ""
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(data => ({ ...data, [name]: value }));
  };

  useEffect(() => {
    console.log(data);
  }, [data])


  const onLogin = async (event) => {
    event.preventDefault()
    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login"
    }
    else {
      newUrl += "/api/user/register"
    }

    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.user._id); // <- Guardar user_id
      setShowLogin(false);
    }
    else {
      alert(response.data.message)
    }
  }

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <i onClick={() => setShowLogin(false)} className="fa-solid fa-xmark"></i>
        </div>

        <div className='login-popup-inputs'>
          {currState === "Sign Up" && (
            <>
              <input
                type="text"
                name="full_name"
                onChange={onChangeHandler}
                value={data.full_name}
                placeholder="Full Name"
                required
              />
              <input
                type="text"
                name="phone"
                onChange={onChangeHandler}
                value={data.phone}
                placeholder="Phone Number"
                required
              />

              <select
                name="role"
                onChange={onChangeHandler}
                value={data.role}
                required
              >
                <option value="">Select Role</option>
                <option value="customer">Customer</option>
                <option value="cafeteria_owner">Cafeteria Owner</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            placeholder="Email"
            required
          />
          <input
            type="password"
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            placeholder="Password"
            required
          />
        </div>

        <button type="sunmit">
          {currState === "Sign Up" ? "Create Account" : "Login"}
        </button>

        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currState === "Login" ? (
          <p>Create new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
        ) : (
          <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginPopUp;
