import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Edit3, Save, X, Heart, Brain, BookOpen, TrendingUp, Award, Target } from 'lucide-react';
import axios from 'axios';

const API = "http://127.0.0.1:8000";

const Profile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMoods: 0,
    totalJournals: 0,
    averageMood: 0,
    streak: 0,
    joinDate: null
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch moods
      const moodsResponse = await axios.get(`${API}/users/${user.id}/moods/`, { headers });
      const moods = moodsResponse.data;
      
      // Fetch journals
      let totalJournals = 0;
      for (const mood of moods) {
        try {
          const journalsResponse = await axios.get(`${API}/users/${user.id}/moods/${mood.id}/journals/`, { headers });
          totalJournals += journalsResponse.data.length;
        } catch (err) {
          console.log(`No journals for mood ${mood.id}`);
        }
      }

      // Calculate stats
      const averageMood = moods.length > 0 
        ? (moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length).toFixed(1)
        : 0;

      const streak = calculateStreak(moods);
      const joinDate = moods.length > 0 ? new Date(Math.min(...moods.map(m => new Date(m.date)))) : new Date();

      setStats({
        totalMoods: moods.length,
        totalJournals,
        averageMood: parseFloat(averageMood),
        streak,
        joinDate
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
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

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API}/users/${user.id}`, {
        name: formData.name,
        email: formData.email,
        password: 'dummy' // Backend might require this, but we're not updating password
      }, { headers: { Authorization: `Bearer ${token}` } });

      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  const getWellnessLevel = (averageMood) => {
    if (averageMood >= 8) return { level: 'Excellent', color: '#4caf50', emoji: '🌟' };
    if (averageMood >= 6) return { level: 'Good', color: '#66bb6a', emoji: '😊' };
    if (averageMood >= 4) return { level: 'Fair', color: '#ffa726', emoji: '🙂' };
    return { level: 'Needs Attention', color: '#ff6b6b', emoji: '💙' };
  };

  const wellness = getWellnessLevel(stats.averageMood);

  return (
    <div className="profile">
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <User className="title-icon" />
          Profile
        </h1>
        <p className="page-subtitle">
          Manage your account and view your wellness journey overview.
        </p>
      </motion.div>

      <div className="profile-content">
        {/* Profile Card */}
        <motion.div
          className="profile-card glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="profile-avatar">
            <div className="avatar-circle">
              <User size={48} />
            </div>
            <div className="wellness-badge" style={{ backgroundColor: wellness.color }}>
              <span className="wellness-emoji">{wellness.emoji}</span>
              <span className="wellness-level">{wellness.level}</span>
            </div>
          </div>

          <div className="profile-info">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label className="form-label">
                    <User size={18} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Mail size={18} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-actions">
                  <motion.button
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={18} />
                    Cancel
                  </motion.button>
                  <motion.button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="loading-spinner-small" />
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="profile-details">
                <h2 className="profile-name">{user?.name || 'User'}</h2>
                <div className="profile-email">
                  <Mail size={18} />
                  {user?.email || 'No email'}
                </div>
                <div className="profile-join-date">
                  <Calendar size={18} />
                  Member since {stats.joinDate ? stats.joinDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 'Recently'}
                </div>
                <motion.button
                  className="btn btn-ghost edit-button"
                  onClick={handleEdit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 size={18} />
                  Edit Profile
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="profile-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="section-title">Your Wellness Journey</h2>
          <div className="stats-grid">
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
                <p className="stat-description">Total mood check-ins</p>
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
                <p className="stat-description">Personal reflections</p>
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
                <p className="stat-description">Overall wellness score</p>
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
                <p className="stat-description">Consecutive check-ins</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Wellness Insights */}
        <motion.div
          className="wellness-insights"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="section-title">Wellness Insights</h2>
          <div className="insights-grid">
            <div className="insight-card glass">
              <div className="insight-icon">
                <Target size={24} />
              </div>
              <div className="insight-content">
                <h3>Consistency</h3>
                <p>
                  {stats.totalMoods > 10 
                    ? "Great job maintaining regular mood tracking! Consistency is key to understanding your mental wellness patterns."
                    : "Keep tracking your mood regularly to build better insights into your mental wellness journey."
                  }
                </p>
              </div>
            </div>

            <div className="insight-card glass">
              <div className="insight-icon">
                <Brain size={24} />
              </div>
              <div className="insight-content">
                <h3>Reflection</h3>
                <p>
                  {stats.totalJournals > 5
                    ? "Excellent reflection practice! Journaling helps process emotions and track personal growth."
                    : "Consider adding journal entries to your mood tracking for deeper self-reflection and insight."
                  }
                </p>
              </div>
            </div>

            <div className="insight-card glass">
              <div className="insight-icon">
                <Heart size={24} />
              </div>
              <div className="insight-content">
                <h3>Wellness Level</h3>
                <p>
                  Your current wellness level is <strong style={{ color: wellness.color }}>{wellness.level}</strong>. 
                  {wellness.level === 'Excellent' && " Keep up the amazing work!"}
                  {wellness.level === 'Good' && " You're doing well! Consider what's working for you."}
                  {wellness.level === 'Fair' && " There's room for improvement. Consider what might help boost your mood."}
                  {wellness.level === 'Needs Attention' && " Consider reaching out for support or trying new wellness strategies."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
