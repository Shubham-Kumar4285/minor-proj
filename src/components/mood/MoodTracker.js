import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Smile, Frown, Meh, Send, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API = "http://127.0.0.1:8000";

const MoodTracker = ({ user }) => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [commentary, setCommentary] = useState('');
  const [loading, setLoading] = useState(false);
  const [moods, setMoods] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Low', color: '#ff6b6b', description: 'Feeling really down' },
    { value: 2, emoji: '😔', label: 'Low', color: '#ff9ff3', description: 'Not feeling great' },
    { value: 3, emoji: '😐', label: 'Below Average', color: '#ffa726', description: 'Could be better' },
    { value: 4, emoji: '🙂', label: 'Average', color: '#ffeb3b', description: 'Okay, nothing special' },
    { value: 5, emoji: '😊', label: 'Good', color: '#4caf50', description: 'Feeling pretty good' },
    { value: 6, emoji: '😄', label: 'Great', color: '#2196f3', description: 'Having a great day' },
    { value: 7, emoji: '🤩', label: 'Excellent', color: '#9c27b0', description: 'Feeling amazing' },
    { value: 8, emoji: '🥰', label: 'Fantastic', color: '#e91e63', description: 'On top of the world' },
    { value: 9, emoji: '😍', label: 'Incredible', color: '#00bcd4', description: 'Absolutely wonderful' },
    { value: 10, emoji: '🌟', label: 'Perfect', color: '#4caf50', description: 'Pure bliss' }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchMoods();
    }
  }, [user]);

  const fetchMoods = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/users/${user.id}/moods/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMoods(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching moods:', error);
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood || !commentary.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API}/users/${user.id}/moods/`, {
        mood: selectedMood.value,
        commentary: commentary.trim(),
        user_id: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setSelectedMood(null);
      setCommentary('');
      
      // Refresh moods
      await fetchMoods();
      
      // Show success animation
      // You could add a toast notification here
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodStats = () => {
    if (moods.length === 0) return { average: 0, trend: 0 };
    
    const average = moods.reduce((sum, mood) => sum + mood.mood, 0) / moods.length;
    const recent = moods.slice(0, 7);
    const older = moods.slice(7, 14);
    
    const recentAvg = recent.reduce((sum, mood) => sum + mood.mood, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, mood) => sum + mood.mood, 0) / older.length : recentAvg;
    
    const trend = recentAvg - olderAvg;
    
    return { average: average.toFixed(1), trend: trend.toFixed(1) };
  };

  const stats = getMoodStats();

  return (
    <div className="mood-tracker">
      <motion.div
        className="mood-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <Brain className="title-icon" />
          Mood Tracker
        </h1>
        <p className="page-subtitle">
          How are you feeling today? Take a moment to check in with yourself.
        </p>
      </motion.div>

      {/* Mood Stats */}
      {moods.length > 0 && (
        <motion.div
          className="mood-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="stats-row">
            <div className="stat-item glass">
              <TrendingUp className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{stats.average}/10</span>
                <span className="stat-label">Average Mood</span>
              </div>
            </div>
            <div className="stat-item glass">
              <Calendar className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{moods.length}</span>
                <span className="stat-label">Total Entries</span>
              </div>
            </div>
            <div className="stat-item glass">
              <MessageSquare className="stat-icon" />
              <div className="stat-content">
                <span className="stat-value">{stats.trend > 0 ? '+' : ''}{stats.trend}</span>
                <span className="stat-label">Trend (7 days)</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mood Selection */}
      <motion.div
        className="mood-selection"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="section-title">How are you feeling right now?</h2>
        <div className="mood-grid">
          {moodOptions.map((mood, index) => (
            <motion.button
              key={mood.value}
              className={`mood-option ${selectedMood?.value === mood.value ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                '--mood-color': mood.color,
                borderColor: selectedMood?.value === mood.value ? mood.color : 'transparent'
              }}
            >
              <div className="mood-emoji">{mood.emoji}</div>
              <div className="mood-info">
                <span className="mood-value">{mood.value}</span>
                <span className="mood-label">{mood.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Commentary Form */}
      <AnimatePresence>
        {selectedMood && (
          <motion.form
            className="commentary-form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="form-group">
              <label className="form-label">
                <MessageSquare size={18} />
                Tell us more about how you're feeling
              </label>
              <textarea
                className="form-textarea"
                placeholder="What's contributing to your mood today? Any thoughts or feelings you'd like to share?"
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                rows={4}
                required
              />
            </div>
            
            <motion.button
              type="submit"
              className="btn btn-primary submit-button"
              disabled={loading || !commentary.trim()}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <div className="loading-spinner-small" />
              ) : (
                <>
                  <Send size={18} />
                  Save Mood Entry
                </>
              )}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Mood History */}
      {moods.length > 0 && (
        <motion.div
          className="mood-history"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="history-header">
            <h2 className="section-title">Your Mood History</h2>
            <motion.button
              className="btn btn-ghost"
              onClick={() => setShowHistory(!showHistory)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showHistory ? 'Hide' : 'Show'} History
            </motion.button>
          </div>
          
          <AnimatePresence>
            {showHistory && (
              <motion.div
                className="history-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                {moods.map((mood, index) => {
                  const moodOption = moodOptions.find(m => m.value === mood.mood);
                  return (
                    <motion.div
                      key={mood.id}
                      className="history-item glass"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="history-mood">
                        <span className="history-emoji">{moodOption?.emoji}</span>
                        <span className="history-rating" style={{ color: moodOption?.color }}>
                          {mood.mood}/10
                        </span>
                      </div>
                      <div className="history-content">
                        <p className="history-commentary">{mood.commentary}</p>
                        <span className="history-date">
                          {new Date(mood.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MoodTracker;
