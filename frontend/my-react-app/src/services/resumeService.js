import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true,
  timeout: 30000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('crackd_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function uploadResume(formData) {
  return client.post('/resumes/upload', formData)
}

export async function getResumeHistory(search = '', sort = 'desc') {
  const params = new URLSearchParams({ search, sort })
  return client.get(`/resumes/history?${params.toString()}`)
}

export async function getResumeReport(id) {
  return client.get(`/resumes/${id}`)
}

export async function downloadResumeReport(id) {
  return client.get(`/resumes/${id}/download`, { responseType: 'blob' })
}

export async function deleteResumeReport(id) {
  return client.delete(`/resumes/${id}`)
}

export async function generateAISuggestions(id) {
  return client.post(`/resumes/${id}/ai-suggestions`)
}

export async function generateCoverLetter(id, jobDescription = '') {
  return client.post(`/resumes/${id}/cover-letter`, { jobDescription })
}

export async function generateInterviewQuestions(id) {
  return client.post(`/resumes/${id}/interview-questions`)
}
