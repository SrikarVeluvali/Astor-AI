import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from "../Services/axiosInterceptor";

const ResetPassword = () => {
  const { id, token } = useParams();
  const navigate = useNavigate();

  const [input, setInput] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (input.newPassword !== input.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`http://127.0.0.1:5000/resetPassword/${id}/${token}`, { newPassword: input.newPassword },{timeout: 0});

      if (res.status === 200) {
        alert("Password Changed Successfully");
        navigate("/auth");
      }
    } catch (error) {
      console.error("Error changing password:", error.message);
      alert("Error changing password. Please try again.");
    }
  };

  return (
    <div className="AuthPage">
      <div className="container active" id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleSubmit}>
            <h1>Reset Password</h1>
            
            <input
              type="password"
              placeholder="Enter Password"
              className="form-control form-control-lg"
              name="newPassword"
              value={input.newPassword}
              onChange={handleChange}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="form-control form-control-lg"
              name="confirmPassword"
              value={input.confirmPassword}
              onChange={handleChange}
            />
            
            <button type="submit">Reset password</button>
          </form>
        </div>
        
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Type your new password here</h1>
              <Link to="/auth">
                <button className="hidden" id="login">Go to Login page</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
