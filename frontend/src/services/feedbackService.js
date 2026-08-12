import api from './api'

const getFeedback = (taskId) => {
  return api.get(`/tasks/${taskId}/feedback`)
}

const addFeedback = (taskId, feedback) => {
  return api.post(`/tasks/${taskId}/feedback`, feedback)
}

export { getFeedback, addFeedback }
