import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../services/dashboardService'

const statusBadge = {
  COMPLETED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-sky-100 text-sky-700',
  PLANNED: 'bg-amber-100 text-amber-700',
  TODO: 'bg-gray-100 text-gray-600',
}

const statusLabel = {
  COMPLETED: 'Completed',
  IN_PROGRESS: 'In Progress',
  PLANNED: 'Planned',
  TODO: 'Todo',
}

const priorityMeta = {
  HIGH: { color: 'text-red-500', icon: 'keyboard_double_arrow_up', label: 'High' },
  MEDIUM: { color: 'text-amber-500', icon: 'keyboard_arrow_up', label: 'Medium' },
  LOW: { color: 'text-blue-500', icon: 'keyboard_arrow_down', label: 'Low' },
}

const taskDot = {
  COMPLETED: 'bg-green-500',
  IN_PROGRESS: 'bg-sky-500',
  TODO: 'bg-gray-400',
}

function StatCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 ${iconBg} ${iconColor} rounded-lg`}>
          <span className="material-symbols-outlined text-[24px]">{icon}</span>
        </div>
      </div>
      <h3 className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-200/50 shadow-sm">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse mb-4" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/50 shadow-sm">
            <div className="p-6 border-b border-gray-200/50">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyTable({ message }) {
  return (
    <tr>
      <td colSpan={4} className="px-6 py-12 text-center">
        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
          inbox
        </span>
        <p className="text-sm text-gray-400">{message}</p>
      </td>
    </tr>
  )
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getDashboard()
        setDashboard(response.data)
      } catch (err) {
        setError('Failed to load dashboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const projectMap = useMemo(() => {
    if (!dashboard?.recentProjects) return {}
    const map = {}
    dashboard.recentProjects.forEach((p) => {
      map[p.id] = p.title
    })
    return map
  }, [dashboard])

  const stats = useMemo(() => {
    if (!dashboard) return []
    return [
      {
        title: 'Total Users',
        value: dashboard.totalUsers,
        icon: 'group',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
      },
      {
        title: 'Total Projects',
        value: dashboard.totalProjects,
        icon: 'folder',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      },
      {
        title: 'Total Tasks',
        value: dashboard.totalTasks,
        icon: 'task_alt',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
      {
        title: 'Total Work Logs',
        value: dashboard.totalWorkLogs,
        icon: 'schedule',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
    ]
  }, [dashboard])

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-red-400 mb-2 block">
          error
        </span>
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
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500">
          Overview of internship management activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Projects
            </h3>
            <Link
              to="/projects"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200/50">
                  <th className="py-3 px-6">Project</th>
                  <th className="py-3 px-6">Technology</th>
                  <th className="py-3 px-6">Deadline</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dashboard.recentProjects.length === 0 ? (
                  <EmptyTable message="No projects yet" />
                ) : (
                  dashboard.recentProjects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-6 font-medium text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">
                            view_kanban
                          </span>
                        </div>
                        {project.title}
                      </td>
                      <td className="py-3 px-6 text-gray-500">
                        {project.technology}
                      </td>
                      <td className="py-3 px-6 text-gray-500">
                        {project.deadline}
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            statusBadge[project.status] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {statusLabel[project.status] || project.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Tasks
            </h3>
            <Link
              to="/tasks"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              View All
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200/50">
                  <th className="py-3 px-6">Task Name</th>
                  <th className="py-3 px-6">Project</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {dashboard.recentTasks.length === 0 ? (
                  <EmptyTable message="No tasks yet" />
                ) : (
                  dashboard.recentTasks.map((task) => {
                    const pri = priorityMeta[task.priority] || priorityMeta.LOW
                    return (
                      <tr
                        key={task.id}
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="py-3 px-6 font-medium text-gray-900">
                          {task.title}
                        </td>
                        <td className="py-3 px-6 text-gray-500">
                          {projectMap[task.projectId] || '-'}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${pri.color}`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {pri.icon}
                            </span>
                            {pri.label}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                taskDot[task.status] || 'bg-gray-400'
                              }`}
                            />
                            {statusLabel[task.status] || task.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
