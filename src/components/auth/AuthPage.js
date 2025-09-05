import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Sparkles, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LoginForm from './Login';
import RegisterForm from './Register';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <motion.div 
          className="auth-branding"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className="brand-logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <Brain className="logo-icon" />
            <span className="brand-name gradient-text">Calmly</span>
          </motion.div>
          
          <motion.h1 
            className="brand-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Your Mental Wellness Journey Starts Here
          </motion.h1>
          
          <motion.p 
            className="brand-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Track your mood, journal your thoughts, and nurture your mental health with beautiful, intuitive tools designed for your wellbeing.
          </motion.p>
          
          <motion.div 
            className="brand-features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <div className="feature-item">
              <Heart className="feature-icon" />
              <span>Mood Tracking</span>
            </div>
            <div className="feature-item">
              <Brain className="feature-icon" />
              <span>Journal Entries</span>
            </div>
            <div className="feature-item">
              <Sparkles className="feature-icon" />
              <span>Insights & Analytics</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Auth Forms */}
        <motion.div 
          className="auth-forms"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="auth-card glass">
            <motion.div 
              className="auth-header"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="auth-title">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="auth-subtitle">
                {isLogin 
                  ? 'Sign in to continue your wellness journey' 
                  : 'Join us and start tracking your mental wellness'
                }
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm onLogin={onLogin} />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm onLogin={onLogin} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div 
              className="auth-switch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <motion.button
                  className="switch-button"
                  onClick={toggleMode}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </motion.button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
