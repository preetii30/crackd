import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
  timeout: 10000,
})

const fakeResponse = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 900))

export async function login({ email, password }) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.token'
    localStorage.setItem('crackd_token', token)
    return fakeResponse({ token, user: { name: 'Crackd User', email } })
  }

  const response = await client.post('/auth/login', { email, password })
  const token = response?.data?.token

  if (token) {
    localStorage.setItem('crackd_token', token)
  }

  return response.data
}

export async function signup({ fullName, email, password }) {
  if (!import.meta.env.VITE_API_BASE_URL) {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signup'
    localStorage.setItem('crackd_token', token)
    return fakeResponse({
      token,
      user: { name: fullName, email },
    })
  }

  const response = await client.post('/auth/register', { fullName, email, password })
  const token = response?.data?.token

  if (token) {
    localStorage.setItem('cracKd_token', token)
  }

  return response.data
}

export function logout() {
  localStorage.removeItem('crackd_token')
}

export function getAuthToken() {
  return localStorage.getItem('crackd_token')
}
