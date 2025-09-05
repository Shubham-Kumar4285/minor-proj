import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, BookOpen, TrendingUp, Calendar, Plus, Sparkles, Target, Award } from 'lucide-react';
import axios from 'axios';

const API = "http://127.0.0.1:8000";

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMoods: 0,
    totalJournals: 0,
    averageMood: 0,
    streak: 0
  });
  const [recentMoods, setRecentMoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch moods
      const moodsResponse = await axios.get(`${API}/users/${user.id}/moods/`, { headers });
      const moods = moodsResponse.data;
      
      // Fetch journals for each mood
      let totalJournals = 0;
      for (const mood of moods) {
        try {
          const journalsResponse = await axios.get(`${API}/users/${user.id}/moods/${mood.id}/journals/`, { headers });
          totalJournals += journalsResponse.data.length;
        } catch (err) {
          console.log(`No journals for mood ${mood.id}`);
        }
      }

      // Calculate average mood
      const averageMood = moods.length > 0 
        ? (moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length).toFixed(1)
        : 0;

      // Calculate streak (simplified - consecutive days with mood entries)
      const streak = calculateStreak(moods);

      setStats({
        totalMoods: moods.length,
        totalJournals,
        averageMood: parseFloat(averageMood),
        streak
      });

      setRecentMoods(moods.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (moods) => {
    if (moods.length === 0) return 0;
    
    const sortedMoods = moods.sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const mood of sortedMoods) {
      const moodDate = new Date(mood.date);
      moodDate.setHours(0, 0, 0, 0);
      
      if (moodDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (moodDate.getTime() < currentDate.getTime()) {
        break;
      }
    }
    
    return streak;
  };

  const getMoodEmoji = (mood) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥰', '😍', '🤗', '🌟'];
    return emojis[Math.min(mood - 1, emojis.length - 1)] || '😐';
  };

  const getMoodColor = (mood) => {
    if (mood <= 3) return '#ff6b6b';
    if (mood <= 6) return '#ffa726';
    if (mood <= 8) return '#66bb6a';
    return '#4caf50';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading your wellness data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-text">{user?.name || 'Friend'}</span>! 👋
          </h1>
          <p className="welcome-subtitle">
            Here's how you've been feeling lately
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="stat-card glass"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-icon">
            <Heart className="stat-icon-svg" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalMoods}</h3>
            <p className="stat-label">Mood Entries</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card glass"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-icon">
            <BookOpen className="stat-icon-svg" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.totalJournals}</h3>
            <p className="stat-label">Journal Entries</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card glass"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-icon">
            <TrendingUp className="stat-icon-svg" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.averageMood}/10</h3>
            <p className="stat-label">Average Mood</p>
          </div>
        </motion.div>

        <motion.div
          className="stat-card glass"
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <div className="stat-icon">
            <Award className="stat-icon-svg" />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{stats.streak}</h3>
            <p className="stat-label">Day Streak</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <motion.button
            className="action-card glass"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/mood')}
          >
            <div className="action-icon">
              <Brain className="action-icon-svg" />
            </div>
            <div className="action-content">
              <h3>Track Mood</h3>
              <p>How are you feeling today?</p>
            </div>
            <Plus className="action-plus" />
          </motion.button>

          <motion.button
            className="action-card glass"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/journal')}
          >
            <div className="action-icon">
              <BookOpen className="action-icon-svg" />
            </div>
            <div className="action-content">
              <h3>Write Journal</h3>
              <p>Reflect on your thoughts</p>
            </div>
            <Plus className="action-plus" />
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Moods */}
      {recentMoods.length > 0 && (
        <motion.div
          className="recent-moods"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="section-title">Recent Moods</h2>
          <div className="moods-list">
            {recentMoods.map((mood, index) => (
              <motion.div
                key={mood.id}
                className="mood-item glass"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="mood-emoji">
                  {getMoodEmoji(mood.mood)}
                </div>
                <div className="mood-content">
                  <div className="mood-header">
                    <span className="mood-rating" style={{ color: getMoodColor(mood.mood) }}>
                      {mood.mood}/10
                    </span>
                    <span className="mood-date">
                      {new Date(mood.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mood-commentary">{mood.commentary}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {stats.totalMoods === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="empty-icon">
            <Sparkles size={64} />
          </div>
          <h3 className="empty-title">Start Your Wellness Journey</h3>
          <p className="empty-subtitle">
            Track your first mood to begin understanding your mental wellness patterns.
          </p>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/mood')}
          >
            <Brain size={18} />
            Track Your First Mood
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
