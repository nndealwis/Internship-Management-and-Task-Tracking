import api from './api'

const getUsers = () => {
  return api.get('/users')
}

const createUser = (userData, profilePhoto) => {
  const formData = new FormData()
  formData.append('userData', new Blob([JSON.stringify(userData)], { type: 'application/json' }))
  if (profilePhoto) {
    formData.append('profilePhoto', profilePhoto)
  }
  return api.post('/users', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

const updateUser = (id, userData, profilePhoto) => {
  const formData = new FormData()
  formData.append('userData', new Blob([JSON.stringify(userData)], { type: 'application/json' }))
  if (profilePhoto) {
    formData.append('profilePhoto', profilePhoto)
  }
  return api.put(`/users/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

const deleteUser = (id) => {
  return api.delete(`/users/${id}`)
}

export { getUsers, createUser, updateUser, deleteUser }
