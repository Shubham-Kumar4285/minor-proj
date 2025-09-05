import React, { useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../../api";
const API = "http://127.0.0.1:8000";

export default function MoodForm({ userId, onMoodAdded }) {
  const [form, setForm] = useState({ mood: "", commentary: "" });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post(`${API}/users/${userId}/moods/`, 
      { ...form, user_id: userId }, 
      { headers: getAuthHeaders() });
    setForm({ mood: "", commentary: "" });
    onMoodAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <label>Mood (1-10):<br />
      <input name="mood" type="number" min="1" max="10" value={form.mood} onChange={handleChange} required /></label>
      <br />
      <label>Commentary:<br />
      <textarea name="commentary" value={form.commentary} onChange={handleChange} required /></label>
      <br />
      <button type="submit">Add Mood</button>
    </form>
  );
}
