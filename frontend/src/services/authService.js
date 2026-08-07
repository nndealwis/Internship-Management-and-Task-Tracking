import api from './api'

const login = (email, password) => {
  return api.post('/auth/login', { email, password })
}

export { login }
