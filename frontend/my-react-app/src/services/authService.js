import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  withCredentials: true,
  timeout: 10000,
})

function persistAuth(payload = {}) {
  try {
    const token = payload?.token
    const user = payload?.user || payload

    if (token) {
      localStorage.setItem('crackd_token', token)
    }

    if (user) {
      localStorage.setItem('crackd_user', JSON.stringify(user))
    }
  } catch (_error) {
    // Ignore storage issues in private browsing or restricted environments.
  }
}

export async function login({ email, password }) {
  const response = await client.post('/auth/login', { email, password })
  const payload = response?.data || response || {}
  persistAuth(payload)

  return payload
}

export async function signup({ fullName, email, password }) {
  const response = await client.post('/auth/signup', { fullName, email, password })
  const payload = response?.data || response || {}
  persistAuth(payload)

  return payload
}

export async function googleAuth({ credential }) {
  const response = await client.post('/auth/google', { credential })
  const payload = response?.data || response || {}
  persistAuth(payload)

  return payload
}

export async function getCurrentUser() {
  const token = getAuthToken();

  const response = await client.get('/auth/check', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateProfile(data) {
  const response = await client.put('/auth/update-profile', data)
  const payload = response?.data || {}
  const user = payload.user || payload
  if (user) {
    localStorage.setItem('crackd_user', JSON.stringify(user))
  }
  return user
}

export function logout() {
  localStorage.removeItem('crackd_token')
  localStorage.removeItem('crackd_user')
}

export function getAuthToken() {
  return localStorage.getItem('crackd_token')
}
