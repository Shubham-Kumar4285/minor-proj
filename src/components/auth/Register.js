import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function RegisterForm({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsSuccess(false);
    
    try {
      const response = await axios.post(`${API}/auth/register`, form);
      setIsSuccess(true);
      setMessage("Account created successfully! You can now sign in.");
      
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          // Convert to form data format for OAuth2PasswordRequestForm
          const loginFormData = new FormData();
          loginFormData.append('username', form.email);
          loginFormData.append('password', form.password);
          
          const loginResponse = await axios.post(`${API}/auth/login`, loginFormData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          });
          localStorage.setItem("token", loginResponse.data.access_token);
          
          // Try to get user data, but if it fails, use the registration data
          try {
            const userResponse = await axios.get(`${API}/users/`, {
              headers: { Authorization: `Bearer ${loginResponse.data.access_token}` }
            });
            const currentUser = userResponse.data.find(user => user.email === form.email);
            if (currentUser) {
              onLogin(currentUser);
            } else {
              onLogin({ email: form.email, name: form.name, id: response.data.id });
            }
          } catch (userErr) {
            // If we can't fetch user data, use the registration data
            onLogin({ email: form.email, name: form.name, id: response.data.id });
          }
        } catch (loginErr) {
          console.error("Auto-login failed:", loginErr);
          // Don't redirect if auto-login fails
        }
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = typeof err.response.data.detail === 'string' 
            ? err.response.data.detail 
            : "Registration failed. Please try again.";
        } else if (err.response.data.message) {
          errorMessage = typeof err.response.data.message === 'string' 
            ? err.response.data.message 
            : "Registration failed. Please try again.";
        }
      }
      
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      className="auth-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-group">
        <label className="form-label">
          <User size={18} />
          Full Name
        </label>
        <input
          name="name"
          type="text"
          className="form-input"
          placeholder="Enter your full name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <Mail size={18} />
          Email Address
        </label>
        <input
          name="email"
          type="email"
          className="form-input"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <Lock size={18} />
          Password
        </label>
        <div className="password-input-container">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />
          <motion.button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
        </div>
        <p className="form-hint">Password must be at least 6 characters long</p>
      </div>

      {message && (
        <motion.div 
          className={`message ${isSuccess ? 'success-message' : 'error-message'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isSuccess ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message}
        </motion.div>
      )}

      <motion.button
        type="submit"
        className="btn btn-primary form-submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
      >
        {loading ? (
          <div className="loading-spinner-small" />
        ) : (
          <>
            <UserPlus size={18} />
            Create Account
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
