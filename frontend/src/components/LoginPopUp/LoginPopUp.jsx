import React, { useContext, useEffect, useState } from 'react';
import "./LoginPopUp.css";
import { StoreContext } from '../../context/StoreContext';
import { assets } from '../../assets/assets';
import axios from "axios";

const LoginPopUp = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login");
  const [data, setData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: ""
  });
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prevData => ({ ...prevData, [name]: value }));

    if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|std\.uni\.edu\.ni)$/;
      setEmailError(!emailRegex.test(value));
    }

    if (currState === "Sign Up") {
      if (name === "full_name" && value.trim().length > 0) {
        setShowPhone(true);
      }
      if (name === "phone" && value.trim().length > 0) {
        setShowEmail(true);
      }
      if (name === "email" && value.trim().length > 0 && !emailError) {
        setShowPassword(true);
      }
    }
  };

  useEffect(() => {
    console.log(data);
  }, [data]);

  const onLogin = async (event) => {
    event.preventDefault();
    if (emailError) {
      alert("Por favor, ingresa un correo electrónico válido que sea institucional");
      return;
    }

    let newUrl = url;
    if (currState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }

    const response = await axios.post(newUrl, {
      ...data,
      ...(currState === "Sign Up" && { full_name: data.full_name, phone: data.phone })
    });
    if (response.data.success) {
      if (response.data.token) {
        // Caso: Login exitoso o cuenta verificada
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        if (response.data.user && response.data.user._id) {
          localStorage.setItem("user_id", response.data.user._id);
        }
        setShowLogin(false);
      } else {
        // Caso: Registro exitoso, pero cuenta pendiente de verificación
        alert("✅ Registro exitoso. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.");
        setCurrState("Login");
      }
    } else {
      alert(response.data.message);
    }

  };


  useEffect(() => {
  setData({
    email: "",
    password: "",
    full_name: "",
    phone: ""
  });
  setShowPhone(false);
  setShowEmail(false);
  setShowPassword(false);
  setEmailError(false);
}, [currState]);

  return (
    <div className='login-popup'>
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <i onClick={() => setShowLogin(false)} className="fa-solid fa-xmark" aria-label="Cerrar ventana de inicio de sesión"></i>
        </div>
        <img src={assets.fasty_logo} alt="Fasty Logo" className='logo' />
        <div className='login-popup-inputs'>
          {currState === "Sign Up" && (
            <>
              <input
                type="text"
                name="full_name"
                onChange={onChangeHandler}
                value={data.full_name}
                placeholder="Nombre completo"
                required
                className={`input-field ${data.full_name.trim().length > 0 ? 'filled' : ''}`}
              />
              {showPhone && (
                <input
                  type="text"
                  name="phone"
                  onChange={onChangeHandler}
                  value={data.phone}
                  placeholder="Número de teléfono"
                  required
                  className={`input-field ${data.phone.trim().length > 0 ? 'filled' : ''}`}
                />
              )}
              {showEmail && (
                <>
                  <input
                    type="text"
                    name="email"
                    onChange={onChangeHandler}
                    value={data.email}
                    placeholder="Correo (@std.uni.edu.ni)"
                    required
                    className={`input-field ${data.email.trim().length > 0 ? 'filled' : ''} ${emailError ? 'error' : ''}`}
                  />
                  {emailError && (
                    <p className="email-error">El correo debe ser institucional "terminar en @std.uni.edu.ni"</p>
                  )}
                </>
              )}
              {showPassword && (
                <input
                  type="password"
                  name="password"
                  onChange={onChangeHandler}
                  value={data.password}
                  placeholder="Contraseña"
                  required
                  className={`input-field ${data.password.trim().length > 0 ? 'filled' : ''}`}
                />
              )}
            </>
          )}
          {currState === "Login" && (
            <>
              <input
                type="text"
                name="email"
                onChange={onChangeHandler}
                value={data.email}
                placeholder="Correo (@std.uni.edu.ni)"
                required
                className={`input-field ${data.email.trim().length > 0 ? 'filled' : ''} ${emailError ? 'error' : ''}`}
              />
              {emailError && (
                <p className="email-error">El correo debe terminar en @std.uni.edu.ni</p>
              )}
              <input
                type="password"
                name="password"
                onChange={onChangeHandler}
                value={data.password} // Fixed typo
                placeholder="Contraseña"
                required
                className={`input-field ${data.password.trim().length > 0 ? 'filled' : ''}`}
              />
            </>
          )}
          <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
        </div>
        <button type="submit" className="login-button">{currState === "Sign Up" ? "Regístrarse" : "Iniciar sesión"}</button>
        <p className="signup-prompt">
          {currState === "Login" ? (
            <>¿No tienes una cuenta? <span onClick={() => setCurrState('Sign Up')}>Regístrarse</span></>
          ) : (
            <>¿Ya tienes una cuenta? <span onClick={() => setCurrState('Login')}>Iniciar sesión</span></>
          )}
        </p>
        <div className="login-popup-condition">
          <p>Al continuar, aceptas las Condiciones de uso y la Política de privacidad de FASTY.</p>
        </div>
      </form>
    </div>
  );
};

export default LoginPopUp;