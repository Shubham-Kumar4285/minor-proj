import React, { useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../../api";
const API = "http://127.0.0.1:8000";

export default function JournalForm({ userId, moodId, onJournalAdded }) {
  const [form, setForm] = useState({ title: "", content: "" });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post(`${API}/users/${userId}/moods/${moodId}/journals/`, 
      { ...form, mood_id: moodId }, 
      { headers: getAuthHeaders() });
    setForm({ title: "", content: "" });
    onJournalAdded();
  };
  return (
    <form onSubmit={handleSubmit} className="card">
      <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
      <textarea name="content" placeholder="Your experience..." value={form.content} onChange={handleChange} required />
      <button type="submit">Add Journal</button>
    </form>
  );
}
