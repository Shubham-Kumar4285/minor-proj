import React, { useEffect, useState } from "react";
import axios from "axios";
import { getAuthHeaders } from "../../api";
const API = "http://127.0.0.1:8000";

export default function MoodList({ userId }) {
  const [moods, setMoods] = useState([]);
  useEffect(() => {
    axios.get(`${API}/users/${userId}/moods/`, { headers: getAuthHeaders() })
      .then(res => setMoods(res.data));
  }, [userId]);
  return (
    <div>
      <h3>Your Mood Log</h3>
      {moods.map(mood => (
        <div key={mood.id} className="card">
          <strong>Mood:</strong> {mood.mood}/10<br/>
          <i>{mood.commentary}</i>
        </div>
      ))}
    </div>
  );
}
