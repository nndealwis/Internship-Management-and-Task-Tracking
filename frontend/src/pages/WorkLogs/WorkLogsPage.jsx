import { useState, useEffect, useMemo } from 'react'
import { getWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog } from '../../services/workLogService'
import { getUsers } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import WorkLogTable from '../../components/worklogs/WorkLogTable'
import WorkLogFormModal from '../../components/worklogs/WorkLogFormModal'
import DeleteDialog from '../../components/common/DeleteDialog'

function WorkLogsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const isAdmin = user?.role === 'ADMIN'
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

  const userMap = useMemo(() => {
    const map = {}
    users.forEach((u) => { map[u.id] = u })
    return map
  }, [users])

  const interns = useMemo(() => users.filter((u) => u.role === 'INTERN'), [users])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const logsRes = await getWorkLogs()
      setWorkLogs(logsRes.data)
      if (isAdmin) {
        try {
          const usersRes = await getUsers()
          setUsers(usersRes.data)
        } catch {
          // ignore
        }
      } else {
        setUsers([{ id: user.userId, name: user.name, role: 'INTERN' }])
      }
    } catch (err) {
      setError('Failed to load work logs. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [isAdmin])

  const filteredLogs = useMemo(() => {
    const query = search.toLowerCase()
    return workLogs.filter((log) => {
      const matchesSearch =
        log.completedWork?.toLowerCase().includes(query) ||
        log.currentWork?.toLowerCase().includes(query) ||
        log.challenges?.toLowerCase().includes(query)
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
        addToast('Work log updated successfully')
      } else {
        await createWorkLog(formData)
        addToast('Work log created successfully')
      }
      setIsFormOpen(false)
      setSelectedLog(null)
      await fetchData()
    } catch (err) {
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteWorkLog(logToDelete.id)
      setIsDeleteOpen(false)
      setLogToDelete(null)
      await fetchData()
      addToast('Work log deleted successfully')
    } catch (err) {
      setError('Failed to delete work log. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Work Logs
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Track daily internship progress and activities' : 'Log your daily progress and activities'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Work Log
        </button>
      </div>

      <div className="bg-white border border-gray-200/50 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {isAdmin && (
            <div className="relative min-w-[200px]">
              <select
                value={filterIntern}
                onChange={(e) => setFilterIntern(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 pl-3 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Interns</option>
                {interns.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </div>
            </div>
          )}
          <div className="relative min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
              calendar_today
            </span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="relative w-full lg:w-[300px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search work logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[20px]">
            error
          </span>
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-gray-50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <WorkLogTable
          workLogs={filteredLogs}
          userMap={userMap}
          onEdit={handleEdit}
          onDelete={isAdmin ? handleDelete : undefined}
          isAdmin={isAdmin}
        />
      )}

      <WorkLogFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedLog(null) }}
        onSubmit={handleFormSubmit}
        workLog={selectedLog}
        isAdmin={isAdmin}
        currentUser={user}
      />

      {isAdmin && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => { setIsDeleteOpen(false); setLogToDelete(null) }}
          onConfirm={handleConfirmDelete}
          itemName={`work log for ${logToDelete?.date || ''}`}
        />
      )}
    </div>
  )
}

export default WorkLogsPage
