import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Edit3, Trash2, Save, X, Calendar, Heart, Search, Filter } from 'lucide-react';
import axios from 'axios';

const API = "http://127.0.0.1:8000";

const Journal = ({ user }) => {
  const [journals, setJournals] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood_id: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch moods first
      const moodsResponse = await axios.get(`${API}/users/${user.id}/moods/`, { headers });
      setMoods(moodsResponse.data);

      // Fetch journals for each mood
      const allJournals = [];
      for (const mood of moodsResponse.data) {
        try {
          const journalsResponse = await axios.get(`${API}/users/${user.id}/moods/${mood.id}/journals/`, { headers });
          const journalsWithMood = journalsResponse.data.map(journal => ({
            ...journal,
            mood: mood
          }));
          allJournals.push(...journalsWithMood);
        } catch (err) {
          console.log(`No journals for mood ${mood.id}`);
        }
      }

      setJournals(allJournals.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.mood_id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      if (editingJournal) {
        // Update existing journal
        await axios.put(`${API}/users/${user.id}/moods/${editingJournal.mood_id}/journals/${editingJournal.id}`, {
          title: formData.title,
          content: formData.content
        }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // Create new journal
        await axios.post(`${API}/users/${user.id}/moods/${formData.mood_id}/journals/`, {
          title: formData.title,
          content: formData.content,
          mood_id: parseInt(formData.mood_id)
        }, { headers: { Authorization: `Bearer ${token}` } });
      }

      // Reset form and refresh data
      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Error saving journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (journal) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/users/${user.id}/moods/${journal.mood_id}/journals/${journal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchData();
    } catch (error) {
      console.error('Error deleting journal:', error);
    }
  };

  const handleEdit = (journal) => {
    setEditingJournal(journal);
    setFormData({
      title: journal.title,
      content: journal.content,
      mood_id: journal.mood_id.toString()
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', mood_id: '' });
    setEditingJournal(null);
    setShowForm(false);
  };

  const filteredJournals = journals.filter(journal => {
    const matchesSearch = journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         journal.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMood = !selectedMood || journal.mood_id.toString() === selectedMood;
    return matchesSearch && matchesMood;
  });

  const getMoodEmoji = (moodValue) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊', '😄', '🤩', '🥰', '😍', '🤗', '🌟'];
    return emojis[Math.min(moodValue - 1, emojis.length - 1)] || '😐';
  };

  if (loading && journals.length === 0) {
    return (
      <div className="journal-loading">
        <div className="loading-spinner" />
        <p>Loading your journal entries...</p>
      </div>
    );
  }

  return (
    <div className="journal">
      <motion.div
        className="journal-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">
          <BookOpen className="title-icon" />
          Journal
        </h1>
        <p className="page-subtitle">
          Capture your thoughts, feelings, and experiences in your personal journal.
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        className="journal-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="controls-row">
          <div className="search-filter">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search journal entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-box">
              <Filter size={18} />
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="filter-select"
              >
                <option value="">All Moods</option>
                {moods.map(mood => (
                  <option key={mood.id} value={mood.id.toString()}>
                    {getMoodEmoji(mood.mood)} {mood.mood}/10 - {new Date(mood.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <motion.button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            New Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Journal Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="journal-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="journal-form glass">
              <div className="form-header">
                <h3>{editingJournal ? 'Edit Journal Entry' : 'New Journal Entry'}</h3>
                <motion.button
                  className="close-button"
                  onClick={resetForm}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="journal-form-content">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="What's on your mind?"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Mood</label>
                  <select
                    className="form-input"
                    value={formData.mood_id}
                    onChange={(e) => setFormData({ ...formData, mood_id: e.target.value })}
                    required
                  >
                    <option value="">Select a mood entry</option>
                    {moods.map(mood => (
                      <option key={mood.id} value={mood.id.toString()}>
                        {getMoodEmoji(mood.mood)} {mood.mood}/10 - {new Date(mood.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Write your thoughts, feelings, experiences, or anything you'd like to remember..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>

                <div className="form-actions">
                  <motion.button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="loading-spinner-small" />
                    ) : (
                      <>
                        <Save size={18} />
                        {editingJournal ? 'Update Entry' : 'Save Entry'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal Entries */}
      <motion.div
        className="journal-entries"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredJournals.length === 0 ? (
          <motion.div
            className="empty-journal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="empty-icon">
              <BookOpen size={64} />
            </div>
            <h3 className="empty-title">
              {journals.length === 0 ? 'Start Your Journal' : 'No Entries Found'}
            </h3>
            <p className="empty-subtitle">
              {journals.length === 0 
                ? 'Begin documenting your thoughts and experiences to track your mental wellness journey.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {journals.length === 0 && (
              <motion.button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                Write Your First Entry
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="entries-grid">
            {filteredJournals.map((journal, index) => (
              <motion.article
                key={journal.id}
                className="journal-entry glass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="entry-header">
                  <div className="entry-mood">
                    <span className="mood-emoji">{getMoodEmoji(journal.mood.mood)}</span>
                    <span className="mood-rating">{journal.mood.mood}/10</span>
                  </div>
                  <div className="entry-actions">
                    <motion.button
                      className="action-button"
                      onClick={() => handleEdit(journal)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit3 size={16} />
                    </motion.button>
                    <motion.button
                      className="action-button delete"
                      onClick={() => handleDelete(journal)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                <div className="entry-content">
                  <h3 className="entry-title">{journal.title}</h3>
                  <p className="entry-text">{journal.content}</p>
                </div>

                <div className="entry-footer">
                  <div className="entry-date">
                    <Calendar size={14} />
                    {new Date(journal.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Journal;
