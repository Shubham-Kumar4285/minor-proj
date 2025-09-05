import axios from "axios";

const API = "http://127.0.0.1:8000";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth API
export async function login(credentials) {
  return await axios.post(`${API}/auth/login`, credentials);
}

export async function register(userData) {
  return await axios.post(`${API}/auth/register`, userData);
}

// Users API
export async function getUsers() {
  return await axios.get(`${API}/users/`, { headers: getAuthHeaders() });
}

export async function getUser(userId) {
  return await axios.get(`${API}/users/${userId}`, { headers: getAuthHeaders() });
}

export async function updateUser(userId, userData) {
  return await axios.put(`${API}/users/${userId}`, userData, { headers: getAuthHeaders() });
}

export async function deleteUser(userId) {
  return await axios.delete(`${API}/users/${userId}`, { headers: getAuthHeaders() });
}

// Moods API
export async function getMoods(userId) {
  return await axios.get(`${API}/users/${userId}/moods/`, { headers: getAuthHeaders() });
}

export async function getMood(userId, moodId) {
  return await axios.get(`${API}/users/${userId}/moods/${moodId}/`, { headers: getAuthHeaders() });
}

export async function createMood(userId, moodData) {
  return await axios.post(`${API}/users/${userId}/moods/`, moodData, { headers: getAuthHeaders() });
}

export async function updateMood(userId, moodId, moodData) {
  return await axios.put(`${API}/users/${userId}/moods/${moodId}/`, moodData, { headers: getAuthHeaders() });
}

export async function deleteMood(userId, moodId) {
  return await axios.delete(`${API}/users/${userId}/moods/${moodId}`, { headers: getAuthHeaders() });
}

// Journals API
export async function getJournals(userId, moodId) {
  return await axios.get(`${API}/users/${userId}/moods/${moodId}/journals/`, { headers: getAuthHeaders() });
}

export async function getJournal(userId, moodId, journalId) {
  return await axios.get(`${API}/users/${userId}/moods/${moodId}/journals/${journalId}`, { headers: getAuthHeaders() });
}

export async function createJournal(userId, moodId, journalData) {
  return await axios.post(`${API}/users/${userId}/moods/${moodId}/journals/`, journalData, { headers: getAuthHeaders() });
}

export async function updateJournal(userId, moodId, journalId, journalData) {
  return await axios.put(`${API}/users/${userId}/moods/${moodId}/journals/${journalId}`, journalData, { headers: getAuthHeaders() });
}

export async function deleteJournal(userId, moodId, journalId) {
  return await axios.delete(`${API}/users/${userId}/moods/${moodId}/journals/${journalId}`, { headers: getAuthHeaders() });
}
