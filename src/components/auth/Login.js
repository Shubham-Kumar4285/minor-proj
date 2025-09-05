import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Convert to form data format for OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('password', form.password);
      
      const response = await axios.post(`${API}/auth/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      localStorage.setItem("token", response.data.access_token);
      
      // Get user data
      const userResponse = await axios.get(`${API}/users/`, {
        headers: { Authorization: `Bearer ${response.data.access_token}` }
      });
      
      // Find the current user by email
      const currentUser = userResponse.data.find(user => user.email === form.username);
      
      if (currentUser) {
        onLogin(currentUser);
      } else {
        onLogin({ 
          email: form.username, 
          name: form.username.split('@')[0],
          id: null 
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      let errorMessage = "Invalid credentials. Please try again.";
      
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = typeof err.response.data.detail === 'string' 
            ? err.response.data.detail 
            : "Invalid credentials. Please try again.";
        } else if (err.response.data.message) {
          errorMessage = typeof err.response.data.message === 'string' 
            ? err.response.data.message 
            : "Invalid credentials. Please try again.";
        }
      }
      
      setError(errorMessage);
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
          <Mail size={18} />
          Email Address
        </label>
        <input
          name="username"
          type="email"
          className="form-input"
          placeholder="Enter your email"
          value={form.username}
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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
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
      </div>

      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle size={16} />
          {error}
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
            <LogIn size={18} />
            Sign In
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
