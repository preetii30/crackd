import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 10000,
})

export async function login({ email, password }) {
  const response = await client.post('/auth/login', { email, password })
  const token = response?.data?.token

  if (token) {
    localStorage.setItem('crackd_token', token)
  }

  return response.data
}

export async function signup({ fullName, email, password }) {
  const response = await client.post('/auth/signup', { fullName, email, password })
  const token = response?.data?.token

  if (token) {
    localStorage.setItem('crackd_token', token)
  }

  return response.data
}

export async function googleAuth({ credential }) {
  const response = await client.post('/auth/google', { credential })
  const token = response?.data?.token

  if (token) {
    localStorage.setItem('crackd_token', token)
  }

  return response.data
}

export function logout() {
  localStorage.removeItem('crackd_token')
}

export function getAuthToken() {
  return localStorage.getItem('crackd_token')
}
