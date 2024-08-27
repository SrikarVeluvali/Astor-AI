import React, { useState } from 'react';
import './styles.css';
// import { FaGooglePlusG, FaFacebookF, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import axios from "../Services/axiosInterceptor";
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  const [isForgetPasswordActive, setForgetPasswordActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  
  const handleRegisterClick = () => {
    setIsActive(true);
    setInput0({
      email: "",
      password: "",
    })
  };

  const handleLoginClick = () => {
    setIsActive(false);
    setForgetPasswordActive(false);
    setInput({
      name: "",
      email: "",
      password: "",
    })
  };

  const handleForgotPasswordClick = () => {
    setForgetPasswordActive(true);
    setIsActive(true);

  }

  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [input0, setInput0] = useState({
    email: "",
    password: "",
  });

  const [forgotPasswordInput, setForgotPasswordInput] = useState({
    email: ""
  });
  // const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Function to handle login form submission
  const handleLogin = async (e) => {
    setAlertMessage("");
    e.preventDefault();
    try {
      // Make a POST request to the login endpoint
      const response = await axios.post("http://127.0.0.1:5000/userlogin", input0);

      // If the login is successful, store user data in local storage and navigate to home
      if (response.status === 200) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("email", response.data.email);

        navigate("/");
      }
    } catch (error) {
      console.error("login failed:", error.response.data.message);
      // Update your UI to show the error message
      // alert(error.response.data.message);
      setAlertMessage("Login Failed: " + error.response.data.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAlertMessage("");

    try {
      const response = await axios.post(`http://127.0.0.1:5000/userregister`, {
        user: input,
      });
      // alert("User Registered Successfully");
      // setRegistrationSuccess(true);
      // If registration is successful, navigate to the login page
      if (response.status === 201) {
        setAlertMessage("User Registered Successfully! Redirecting to login page!");
        setTimeout(() => {
          setIsActive(false);
        }, 3000); // 3000 milliseconds = 3 seconds
      }
    } catch (error) {
      console.error("Registration failed:", error.response.data.message);
      // Update your UI to show the error message
      // alert(error.response.data.message);
      setAlertMessage("Registration failed: " + error.response.data.message);
    }
  };

  const handleForgotPassword = async (e) => {
    setAlertMessage("");
    e.preventDefault();
    try {

      const response1 = await axios.post("http://127.0.0.1:5000/forgotPassword", { email: forgotPasswordInput.email }, { timeout: 0 });
      console.log("response received")

      if (response1.status === 200) {
        // alert("Verification link sent to your email. Please check your inbox.");
        setAlertMessage("Verification link sent to your email. Please check your inbox.");
        setForgetPasswordActive(false);
        setIsActive(false);
      }
    } catch (error) {
      console.log("there was an error in response")
      if (error.response) {
        console.error("Failed to send verification link:", error.response.data.message);
        // alert(error.response.data.message);
        setAlertMessage("Failed to send verification link: " + error.response.data.message);
      } else if (error.request) {
        console.error("No response received from the server:", error.request);
        setAlertMessage("No response received from the server. Please try again later.");
      } else {
        console.error("Error in setting up the request:", error.message);
        setAlertMessage("An error occurred. Please try again later.");
      }
    }
  };


  return (
    <div className="AuthPage">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        {isForgetPasswordActive ? (
          <div className="form-container sign-up">
            <form onSubmit={handleForgotPassword}>
              <h1>Forgot Password?</h1>


              <span style={{ color: 'red' }}>{alertMessage}</span>
              {/* <input type="email" placeholder="Email" /> */}
              <input
                type="email"
                placeholder="Enter Valid Email Address"
                className="form-control form-control-lg"
                name="email"
                value={forgotPasswordInput.email}
                onChange={(e) =>
                  setForgotPasswordInput({
                    ...forgotPasswordInput,
                    [e.target.name]: e.target.value,
                  })
                }
              />

              <button type="submit">Send verification link</button>
            </form>
          </div>
        ) : (
          <div className="form-container sign-up">
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <div className="social-icons">
                {/* <a href="#" className="icon"><FaGooglePlusG /></a>
                        <a href="#" className="icon"><FaFacebookF /></a>
                        <a href="#" className="icon"><FaGithub /></a>
                        <a href="#" className="icon"><FaLinkedinIn /></a> */}
              </div>
              <span style={{ color: 'red' }}>{alertMessage}</span>
              <span>Use your email for registration</span>
              {/* <input type="text" placeholder="Name" /> */}

              <input
                type="text"
                placeholder="Enter Your Name"
                className="form-control form-control-lg"
                name="name"
                value={input.name}
                onChange={(e) =>
                  setInput({
                    ...input,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              {/* <input type="email" placeholder="Email" /> */}
              <input
                type="email"
                placeholder="Enter Valid Email Address"
                className="form-control form-control-lg"
                name="email"
                value={input.email}
                onChange={(e) =>
                  setInput({
                    ...input,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              {/* <input type="password" placeholder="Password" /> */}
              <input
                type="password"
                placeholder="Enter Password"
                className="form-control form-control-lg"
                name="password"
                value={input.password}
                onChange={(e) =>
                  setInput({
                    ...input,
                    [e.target.name]: e.target.value,
                  })
                }
              />
              <button type="submit">Sign Up</button>
            </form>
          </div>
        )}



        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <div className="social-icons">
              {/* <a href="#" className="icon"><FaGooglePlusG /></a>
                        <a href="#" className="icon"><FaFacebookF /></a>
                        <a href="#" className="icon"><FaGithub /></a>
                        <a href="#" className="icon"><FaLinkedinIn /></a> */}
            </div>
            <span style={{ color: 'red' }}>{alertMessage}</span>
            <span>Use your email account</span>
            {/* <input type="email" placeholder="Email" /> */}
            <input
              type="email"
              id="form3Example3"
              placeholder="Enter Email"
              className="form-control form-control-lg"
              name="email"
              value={input0.email}
              onChange={(e) =>
                setInput0({
                  ...input0,
                  [e.target.name]: e.target.value,
                })
              }
            />
            {/* <input type="password" placeholder="Password" /> */}
            <input
              type="password"
              id="form3Example4"
              placeholder="Enter Password"
              className="form-control form-control-lg"
              name="password"
              value={input0.password}
              onChange={(e) =>
                setInput0({
                  ...input0,
                  [e.target.name]: e.target.value,
                })
              }
            />
            <p onClick={handleForgotPasswordClick} style={{ cursor: 'pointer' }}>Forgot Password?</p>
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            {isForgetPasswordActive ? (
              <div className="toggle-panel toggle-left">
                <h1>Type your email here</h1>
                <p>We will send you an email with a password setup link. Follow the instructions there to reset your password.</p>
                <button className="hidden" id="login" onClick={handleLoginClick}>Sign In</button>
              </div>
            ) : (
              <div className="toggle-panel toggle-left">
                <h1>Welcome Back!</h1>
                <p>Enter your personal details to use all site features</p>
                <button className="hidden" id="login" onClick={handleLoginClick}>Sign In</button>
              </div>
            )}

            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all site features</p>
              <button className="hidden" id="register" onClick={handleRegisterClick}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;