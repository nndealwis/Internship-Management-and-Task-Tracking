import api from './api'

const getUsers = () => {
  return api.get('/users')
}

const createUser = (user) => {
  return api.post('/users', user)
}

const updateUser = (id, user) => {
  return api.put(`/users/${id}`, user)
}

const deleteUser = (id) => {
  return api.delete(`/users/${id}`)
}

export { getUsers, createUser, updateUser, deleteUser }
