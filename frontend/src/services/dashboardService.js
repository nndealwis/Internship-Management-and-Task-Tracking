import api from './api'

const getDashboard = () => {
  return api.get('/dashboard')
}

export { getDashboard }
