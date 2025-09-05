import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../../api";
const API = "http://127.0.0.1:8000";

export default function JournalList({ userId, moodId }) {
  const [journals, setJournals] = useState([]);
  useEffect(() => {
    axios.get(`${API}/users/${userId}/moods/${moodId}/journals/`, { headers: getAuthHeaders() })
      .then(res => setJournals(res.data));
  }, [userId, moodId]);
  return (
    <div>
      <h4>Journals</h4>
      {journals.map(j => (
        <div key={j.id} className="card">
          <strong>{j.title}</strong>
          <p>{j.content}</p>
        </div>
      ))}
    </div>
  );
}
