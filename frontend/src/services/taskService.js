import api from './api'

const getTasks = () => {
  return api.get('/tasks')
}

const getTasksByProjectId = (projectId) => {
  return api.get(`/tasks/project/${projectId}`)
}

const createTask = (task) => {
  return api.post('/tasks', task)
}

const updateTask = (id, task) => {
  return api.put(`/tasks/${id}`, task)
}

const deleteTask = (id) => {
  return api.delete(`/tasks/${id}`)
}

export { getTasks, getTasksByProjectId, createTask, updateTask, deleteTask }
