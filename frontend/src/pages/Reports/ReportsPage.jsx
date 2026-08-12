import { useState, useEffect, useMemo } from 'react'
import { getUsers } from '../../services/userService'
import { getProjects } from '../../services/projectService'
import { getTasks } from '../../services/taskService'
import { getWorkLogs } from '../../services/workLogService'
import UserAvatar from '../../components/common/UserAvatar'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function isOverdue(deadline, status) {
  if (!deadline || status === 'COMPLETED') return false
  return deadline < today()
}

function isDueToday(deadline, status) {
  if (!deadline || status === 'COMPLETED') return false
  return deadline === today()
}

function isDueSoon(deadline, status) {
  if (!deadline || status === 'COMPLETED') return false
  const d = new Date(deadline + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = (d - now) / (1000 * 60 * 60 * 24)
  return diff > 0 && diff <= 7
}

// --- Summary Stat Card ---
function StatCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/50 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 ${iconBg} rounded-lg flex-shrink-0`}>
          <span className={`material-symbols-outlined text-[22px] ${iconColor}`}>{icon}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  )
}

// --- Progress Bar ---
function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-600 w-9 text-right">{pct}%</span>
    </div>
  )
}

// --- Status Dot ---
const statusDotColors = {
  overdue: 'bg-red-500',
  todo: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
}

// --- Loading Skeleton ---
function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-200/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
              <div>
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="p-5 border-b border-gray-200/50">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================
function ReportsPage() {
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [workLogs, setWorkLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [filterProject, setFilterProject] = useState('')
  const [filterIntern, setFilterIntern] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)
        const [usersRes, projectsRes, tasksRes, workLogsRes] = await Promise.all([
          getUsers(),
          getProjects(),
          getTasks(),
          getWorkLogs(),
        ])
        setUsers(usersRes.data)
        setProjects(projectsRes.data)
        setTasks(tasksRes.data)
        setWorkLogs(workLogsRes.data)
      } catch (err) {
        setError('Unable to load report data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // --- Derived data ---
  const interns = useMemo(() => users.filter((u) => u.role === 'INTERN'), [users])

  const userMap = useMemo(() => {
    const map = {}
    users.forEach((u) => { map[u.id] = u })
    return map
  }, [users])

  const projectMap = useMemo(() => {
    const map = {}
    projects.forEach((p) => { map[p.id] = p })
    return map
  }, [projects])

  // --- Filtered tasks ---
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterProject && t.projectId !== filterProject) return false
      if (filterIntern && t.assignedInternId !== filterIntern) return false
      if (filterStatus) {
        if (filterStatus === 'OVERDUE') {
          if (!isOverdue(t.deadline, t.status)) return false
        } else if (t.status !== filterStatus) {
          return false
        }
      }
      if (filterDateFrom && t.deadline < filterDateFrom) return false
      if (filterDateTo && t.deadline > filterDateTo) return false
      return true
    })
  }, [tasks, filterProject, filterIntern, filterStatus, filterDateFrom, filterDateTo])

  // --- Filtered work logs ---
  const filteredWorkLogs = useMemo(() => {
    return workLogs.filter((wl) => {
      if (filterIntern && wl.internId !== filterIntern) return false
      if (filterDateFrom && wl.date < filterDateFrom) return false
      if (filterDateTo && wl.date > filterDateTo) return false
      return true
    })
  }, [workLogs, filterIntern, filterDateFrom, filterDateTo])

  // --- Summary stats ---
  const summary = useMemo(() => {
    const totalInterns = interns.length
    const activeProjects = filterProject
      ? projects.filter((p) => p.id === filterProject).length
      : projects.filter((p) => p.status !== 'COMPLETED').length
    const totalTasks = filteredTasks.length
    const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED').length
    return { totalInterns, activeProjects, totalTasks, completedTasks }
  }, [interns, projects, filteredTasks, filterProject])

  // --- Task progress breakdown ---
  const taskProgress = useMemo(() => {
    const todo = filteredTasks.filter((t) => t.status === 'TODO').length
    const inProgress = filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length
    const completed = filteredTasks.filter((t) => t.status === 'COMPLETED').length
    const overdue = filteredTasks.filter((t) => isOverdue(t.deadline, t.status)).length
    return { todo, inProgress, completed, overdue, total: filteredTasks.length }
  }, [filteredTasks])

  // --- Project progress ---
  const projectProgress = useMemo(() => {
    let projectList = projects
    if (filterProject) {
      projectList = projects.filter((p) => p.id === filterProject)
    }
    return projectList.map((project) => {
      const projectTasks = filteredTasks.filter((t) => t.projectId === project.id)
      const total = projectTasks.length
      const completed = projectTasks.filter((t) => t.status === 'COMPLETED').length
      const inProgress = projectTasks.filter((t) => t.status === 'IN_PROGRESS').length
      const pending = projectTasks.filter((t) => t.status === 'TODO').length
      const overdue = projectTasks.filter((t) => isOverdue(t.deadline, t.status)).length
      const internCount = project.assignedInternIds?.length || 0
      return { project, total, completed, inProgress, pending, overdue, internCount }
    })
  }, [projects, filteredTasks, filterProject])

  // --- Intern performance ---
  const internPerformance = useMemo(() => {
    let internList = interns
    if (filterIntern) {
      internList = interns.filter((i) => i.id === filterIntern)
    }
    return internList.map((intern) => {
      const internTasks = filteredTasks.filter((t) => t.assignedInternId === intern.id)
      const internProjects = projects.filter((p) => p.assignedInternIds?.includes(intern.id))
      const internWL = filteredWorkLogs.filter((wl) => wl.internId === intern.id)
      const total = internTasks.length
      const completed = internTasks.filter((t) => t.status === 'COMPLETED').length
      const inProgress = internTasks.filter((t) => t.status === 'IN_PROGRESS').length
      const pending = internTasks.filter((t) => t.status === 'TODO').length
      const overdue = internTasks.filter((t) => isOverdue(t.deadline, t.status)).length
      const workLogCount = internWL.length
      return { intern, projectCount: internProjects.length, total, completed, inProgress, pending, overdue, workLogCount }
    })
  }, [interns, filteredTasks, projects, filteredWorkLogs, filterIntern])

  // --- Work log summary ---
  const workLogSummary = useMemo(() => {
    let internList = interns
    if (filterIntern) {
      internList = interns.filter((i) => i.id === filterIntern)
    }
    return internList.map((intern) => {
      const internWL = filteredWorkLogs.filter((wl) => wl.internId === intern.id)
      const totalHours = internWL.reduce((sum, wl) => sum + (wl.hoursWorked || 0), 0)
      const latest = internWL.length > 0
        ? internWL.reduce((max, wl) => (wl.date > max ? wl.date : max), internWL[0].date)
        : null
      return { intern, totalHours: Math.round(totalHours * 10) / 10, count: internWL.length, latestDate: latest }
    }).filter((s) => s.count > 0 || filterIntern)
  }, [interns, filteredWorkLogs, filterIntern])

  // --- Deadline / Overdue tasks ---
  const deadlineTasks = useMemo(() => {
    const overdue = filteredTasks
      .filter((t) => isOverdue(t.deadline, t.status))
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
    const dueToday = filteredTasks
      .filter((t) => isDueToday(t.deadline, t.status))
    const dueSoon = filteredTasks
      .filter((t) => isDueSoon(t.deadline, t.status))
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
    return { overdue, dueToday, dueSoon }
  }, [filteredTasks])

  const hasActiveFilters = filterProject || filterIntern || filterStatus || filterDateFrom || filterDateTo

  const clearFilters = () => {
    setFilterProject('')
    setFilterIntern('')
    setFilterStatus('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  // ===================================================================
  // RENDER
  // ===================================================================

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">error</span>
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-red-700 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Reports</h2>
        <p className="text-sm text-gray-500">InternTrack performance overview</p>
      </div>

      {/* ============= FILTERS ============= */}
      <div className="bg-white border border-gray-200/50 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Date From */}
            <div className="relative">
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Date To */}
            <div className="relative">
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {/* Project */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            {/* Intern */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Intern</label>
              <select
                value={filterIntern}
                onChange={(e) => setFilterIntern(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Interns</option>
                {interns.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className="block text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>
          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors whitespace-nowrap mt-auto"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ============= SUMMARY CARDS ============= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Interns" value={summary.totalInterns} icon="group" iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard title="Active Projects" value={summary.activeProjects} icon="folder" iconBg="bg-slate-100" iconColor="text-slate-600" />
        <StatCard title="Total Tasks" value={summary.totalTasks} icon="assignment" iconBg="bg-orange-50" iconColor="text-orange-600" />
        <StatCard title="Completed Tasks" value={summary.completedTasks} icon="check_circle" iconBg="bg-green-50" iconColor="text-green-600" />
      </div>

      {/* ============= TASK PROGRESS ============= */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress</h3>
        {taskProgress.total === 0 ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-3xl text-gray-300 block mb-1">assignment</span>
            <p className="text-sm text-gray-400">No tasks match the selected filters.</p>
          </div>
        ) : (
          <>
            {/* Overall progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Overall Completion</span>
                <span className="font-semibold">{taskProgress.total > 0 ? Math.round((taskProgress.completed / taskProgress.total) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
                {taskProgress.completed > 0 && (
                  <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(taskProgress.completed / taskProgress.total) * 100}%` }} />
                )}
                {taskProgress.inProgress > 0 && (
                  <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${(taskProgress.inProgress / taskProgress.total) * 100}%` }} />
                )}
                {taskProgress.todo > 0 && (
                  <div className="bg-gray-300 h-full transition-all duration-500" style={{ width: `${(taskProgress.todo / taskProgress.total) * 100}%` }} />
                )}
              </div>
            </div>
            {/* Breakdown cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDotColors.todo}`} />
                <div>
                  <p className="text-xs text-gray-500">To Do</p>
                  <p className="text-lg font-bold text-gray-900">{taskProgress.todo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDotColors.in_progress}`} />
                <div>
                  <p className="text-xs text-gray-500">In Progress</p>
                  <p className="text-lg font-bold text-gray-900">{taskProgress.inProgress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-green-50/50 rounded-lg p-3 border border-green-100">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDotColors.completed}`} />
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-lg font-bold text-gray-900">{taskProgress.completed}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50/50 rounded-lg p-3 border border-red-100">
                <span className={`w-2.5 h-2.5 rounded-full ${statusDotColors.overdue}`} />
                <div>
                  <p className="text-xs text-gray-500">Overdue</p>
                  <p className="text-lg font-bold text-gray-900">{taskProgress.overdue}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ============= PROJECT PROGRESS ============= */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/50">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Interns</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Total</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Completed</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">In Progress</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Pending</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Overdue</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projectProgress.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-gray-300 block mb-1">folder</span>
                    <p className="text-sm text-gray-400">No projects found.</p>
                  </td>
                </tr>
              ) : (
                projectProgress.map(({ project, total, completed, inProgress, pending, overdue, internCount }) => (
                  <tr key={project.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-gray-900">{project.title}</p>
                      {project.technology && (
                        <p className="text-xs text-gray-400 mt-0.5">{project.technology}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-gray-600">{internCount}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{total}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-green-600 font-medium">{completed}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-blue-600 font-medium">{inProgress}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-gray-500">{pending}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {overdue > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">{overdue}</span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ProgressBar value={completed} max={total} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============= INTERN PERFORMANCE ============= */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">Intern Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/50">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Projects</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Total Tasks</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Completed</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">In Progress</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Pending</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Overdue</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Work Logs</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {internPerformance.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-gray-300 block mb-1">group</span>
                    <p className="text-sm text-gray-400">No interns found.</p>
                  </td>
                </tr>
              ) : (
                internPerformance.map(({ intern, projectCount, total, completed, inProgress, pending, overdue, workLogCount }) => (
                  <tr key={intern.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={intern} size="w-8 h-8" textSize="text-xs" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{intern.name}</p>
                          <p className="text-xs text-gray-400 truncate">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-gray-600">{projectCount}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm font-medium text-gray-900">{total}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-green-600 font-medium">{completed}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-blue-600 font-medium">{inProgress}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-gray-500">{pending}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {overdue > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">{overdue}</span>
                      ) : (
                        <span className="text-sm text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-gray-600">{workLogCount}</span>
                    </td>
                    <td className="px-5 py-3">
                      <ProgressBar value={completed} max={total} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============= WORK LOG SUMMARY ============= */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">Work Log Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/50">
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Logged Hours</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Work Logs</th>
                <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Latest Work Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workLogSummary.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <span className="material-symbols-outlined text-3xl text-gray-300 block mb-1">history</span>
                    <p className="text-sm text-gray-400">No work log data available for the selected filters.</p>
                  </td>
                </tr>
              ) : (
                workLogSummary.map(({ intern, totalHours, count, latestDate }) => (
                  <tr key={intern.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={intern} size="w-8 h-8" textSize="text-xs" />
                        <span className="text-sm font-medium text-gray-900">{intern.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {totalHours} hrs
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="text-sm text-gray-600">{count}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm text-gray-500">{latestDate ? formatDate(latestDate) : '—'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============= DEADLINE / OVERDUE ============= */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline Overview</h3>

        {deadlineTasks.overdue.length === 0 && deadlineTasks.dueToday.length === 0 && deadlineTasks.dueSoon.length === 0 ? (
          <div className="text-center py-6">
            <span className="material-symbols-outlined text-3xl text-green-400 block mb-1">event_available</span>
            <p className="text-sm text-gray-400">No upcoming or overdue deadlines.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overdue */}
            {deadlineTasks.overdue.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <h4 className="text-sm font-semibold text-red-700 uppercase tracking-wider">
                    Overdue ({deadlineTasks.overdue.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {deadlineTasks.overdue.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-red-50/50 border border-red-100 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span>{userMap[task.assignedInternId]?.name || '—'}</span>
                          <span className="text-gray-300">·</span>
                          <span>{projectMap[task.projectId]?.title || '—'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-red-600 whitespace-nowrap flex-shrink-0">
                        Due {formatDate(task.deadline)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Today */}
            {deadlineTasks.dueToday.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wider">
                    Due Today ({deadlineTasks.dueToday.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {deadlineTasks.dueToday.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span>{userMap[task.assignedInternId]?.name || '—'}</span>
                          <span className="text-gray-300">·</span>
                          <span>{projectMap[task.projectId]?.title || '—'}</span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 whitespace-nowrap flex-shrink-0">
                        Today
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Soon */}
            {deadlineTasks.dueSoon.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                    Due Soon ({deadlineTasks.dueSoon.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {deadlineTasks.dueSoon.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-blue-50/30 border border-blue-100 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                          <span>{userMap[task.assignedInternId]?.name || '—'}</span>
                          <span className="text-gray-300">·</span>
                          <span>{projectMap[task.projectId]?.title || '—'}</span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-blue-600 whitespace-nowrap flex-shrink-0">
                        Due {formatDate(task.deadline)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
