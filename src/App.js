import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Heart, BookOpen, LogOut, User, Moon, Sun, Menu, X, Home, BarChart3 } from "lucide-react";

// Components
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import MoodTracker from "./components/mood/MoodTracker";
import Journal from "./components/journal/Journal";
import Profile from "./components/profile/Profile";
import LoadingSpinner from "./components/common/LoadingSpinner";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Default to light mode
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const savedTheme = localStorage.getItem("theme");
    
    if (token && userData) {
      setLoggedIn(true);
      setCurrentUser(JSON.parse(userData));
    }
    
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogin = (userData) => {
    setLoggedIn(true);
    setCurrentUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <Router>
        <AnimatePresence mode="wait">
          {!loggedIn ? (
            <motion.div
              key="auth"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <AuthPage onLogin={handleLogin} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="app-container"
            >
              {/* Header */}
              <motion.header 
                className="app-header"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="header-content">
                  <div className="header-left">
                    <motion.button
                      className="sidebar-toggle"
                      onClick={toggleSidebar}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Menu size={20} />
                    </motion.button>
                    
                    <motion.div 
                      className="logo"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Brain className="logo-icon" />
                      <span className="logo-text">Calmly</span>
                    </motion.div>
                  </div>
                  
                  <nav className="nav-menu">
                    <motion.button
                      className="nav-item"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleDarkMode}
                      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                    >
                      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>
                    
                    <motion.button
                      className="nav-item"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogout}
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </motion.button>
                  </nav>
                </div>
              </motion.header>

              <div className="app-body">
                {/* Sidebar */}
                <motion.aside 
                  className={`sidebar ${sidebarOpen ? 'open' : ''}`}
                  initial={{ x: -280 }}
                  animate={{ x: sidebarOpen ? 0 : -280 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="sidebar-header">
                    <h3>Navigation</h3>
                    <motion.button
                      className="sidebar-close"
                      onClick={toggleSidebar}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                  
                  <nav className="sidebar-nav">
                    <SidebarNavItem icon={Home} label="Dashboard" path="/" />
                    <SidebarNavItem icon={BarChart3} label="Mood Tracker" path="/mood" />
                    <SidebarNavItem icon={BookOpen} label="Journal" path="/journal" />
                    <SidebarNavItem icon={User} label="Profile" path="/profile" />
                  </nav>
                </motion.aside>

                {/* Main Content */}
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard user={currentUser} />} />
                    <Route path="/mood" element={<MoodTracker user={currentUser} />} />
                    <Route path="/journal" element={<Journal user={currentUser} />} />
                    <Route path="/profile" element={<Profile user={currentUser} onUpdate={setCurrentUser} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>

              {/* Sidebar Overlay */}
              {sidebarOpen && (
                <motion.div
                  className="sidebar-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleSidebar}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Router>
    </div>
  );
}

// Sidebar Navigation Item Component
function SidebarNavItem({ icon: Icon, label, path }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <motion.div
        className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
      >
        <Icon size={20} />
        <span>{label}</span>
      </motion.div>
    </Link>
  );
}

export default App;
