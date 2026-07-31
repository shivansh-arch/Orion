import { getToken, logout } from './auth.js';

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }
  return response;
}

export async function signup(email, password) {
  const res = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function sendMessage(message, conversationId) {
  const body = { message };
  if (conversationId) body.conversationId = conversationId;
  const res = await request('/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function getConversations() {
  const res = await request('/conversations');
  return res.json();
}

export async function getMessages(conversationId) {
  const res = await request(`/conversations/${conversationId}/messages`);
  return res.json();
}

export async function deleteConversation(conversationId) {
  const res = await request(`/conversations/${conversationId}`, {
    method: 'DELETE',
  });
  return res.json();
}
