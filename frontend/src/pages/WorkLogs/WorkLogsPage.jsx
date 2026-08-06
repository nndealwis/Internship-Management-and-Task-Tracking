import { useState, useEffect, useMemo } from 'react'
import { getWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog } from '../../services/workLogService'
import { getUsers } from '../../services/userService'
import WorkLogTable from '../../components/worklogs/WorkLogTable'
import WorkLogFormModal from '../../components/worklogs/WorkLogFormModal'
import DeleteDialog from '../../components/common/DeleteDialog'

function WorkLogsPage() {
  const [workLogs, setWorkLogs] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filterIntern, setFilterIntern] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [logToDelete, setLogToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [logsRes, usersRes] = await Promise.all([
        getWorkLogs(),
        getUsers(),
      ])
      setWorkLogs(logsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      setError('Failed to load work logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase()
    return workLogs.filter((log) => {
      const matchesSearch =
        log.completedWork?.toLowerCase().includes(query) ||
        log.currentWork?.toLowerCase().includes(query)
      const matchesIntern = !filterIntern || log.internId === filterIntern
      const matchesDate = !filterDate || log.date === filterDate
      return matchesSearch && matchesIntern && matchesDate
    })
  }, [workLogs, search, filterIntern, filterDate])

  const handleCreate = () => {
    setSelectedLog(null)
    setIsFormOpen(true)
  }

  const handleEdit = (log) => {
    setSelectedLog(log)
    setIsFormOpen(true)
  }

  const handleDelete = (log) => {
    setLogToDelete(log)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedLog) {
        await updateWorkLog(selectedLog.id, formData)
      } else {
        await createWorkLog(formData)
      }
      setIsFormOpen(false)
      setSelectedLog(null)
      await fetchData()
    } catch (err) {
      setError('Operation failed. Please try again.')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteWorkLog(logToDelete.id)
      setIsDeleteOpen(false)
      setLogToDelete(null)
      await fetchData()
    } catch (err) {
      setError('Failed to delete work log. Please try again.')
    }
  }

  const interns = users.filter((u) => u.role === 'INTERN')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Work Logs</h2>
          <p className="text-sm text-gray-500">Manage daily internship work logs</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Work Log
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by completed or current work..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterIntern}
            onChange={(e) => setFilterIntern(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Interns</option>
            {interns.map((intern) => (
              <option key={intern.id} value={intern.id}>{intern.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          Loading work logs...
        </div>
      ) : (
        <WorkLogTable
          workLogs={filteredLogs}
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <WorkLogFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedLog(null) }}
        onSubmit={handleFormSubmit}
        workLog={selectedLog}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setLogToDelete(null) }}
        onConfirm={handleConfirmDelete}
        itemName={`work log for ${logToDelete?.date || ''}`}
      />
    </div>
  )
}

export default WorkLogsPage
