import api from './api'

const getProjects = () => {
  return api.get('/projects')
}

const createProject = (project) => {
  return api.post('/projects', project)
}

const updateProject = (id, project) => {
  return api.put(`/projects/${id}`, project)
}

const deleteProject = (id) => {
  return api.delete(`/projects/${id}`)
}

export { getProjects, createProject, updateProject, deleteProject }
