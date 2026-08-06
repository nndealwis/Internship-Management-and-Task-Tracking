import api from './api'

const getWorkLogs = () => {
  return api.get('/worklogs')
}

const createWorkLog = (workLog) => {
  return api.post('/worklogs', workLog)
}

const updateWorkLog = (id, workLog) => {
  return api.put(`/worklogs/${id}`, workLog)
}

const deleteWorkLog = (id) => {
  return api.delete(`/worklogs/${id}`)
}

export { getWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog }
