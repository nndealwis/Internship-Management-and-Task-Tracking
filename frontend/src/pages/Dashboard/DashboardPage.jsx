import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../../services/dashboardService'
import { getTasks } from '../../services/taskService'
import { getProjects } from '../../services/projectService'
import { useAuth } from '../../context/AuthContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

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
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [dashboard, setDashboard] = useState(null)
  const [allTasks, setAllTasks] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const [dashRes, tasksRes, projectsRes] = await Promise.all([
          getDashboard(),
          getTasks(),
          getProjects(),
        ])
        setDashboard(dashRes.data)
        setAllTasks(tasksRes.data)
        setAllProjects(projectsRes.data)
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

  const allProjectMap = useMemo(() => {
    const map = {}
    allProjects.forEach((p) => {
      map[p.id] = p
    })
    return map
  }, [allProjects])

  const userMap = useMemo(() => {
    const map = {}
    allTasks.forEach((t) => {
      if (t.assignedInternId && !map[t.assignedInternId]) {
        map[t.assignedInternId] = { id: t.assignedInternId }
      }
    })
    return map
  }, [allTasks])

  const stats = useMemo(() => {
    if (!dashboard) return []
    if (isAdmin) {
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
    }
    return [
      {
        title: 'My Projects',
        value: dashboard.totalProjects,
        icon: 'folder',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
      },
      {
        title: 'My Tasks',
        value: dashboard.totalTasks,
        icon: 'task_alt',
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-600',
      },
      {
        title: 'Completed',
        value: dashboard.completedTasks,
        icon: 'check_circle',
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
      },
      {
        title: 'My Work Logs',
        value: dashboard.totalWorkLogs,
        icon: 'schedule',
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
      },
    ]
  }, [dashboard, isAdmin])

  // Task completion chart data (role-based)
  const chartData = useMemo(() => {
    if (!dashboard) return []
    const relevantTasks = isAdmin ? allTasks : dashboard.recentTasks || []
    const todoCount = relevantTasks.filter(t => t.status === 'TODO').length
    const inProgressCount = relevantTasks.filter(t => t.status === 'IN_PROGRESS').length
    const completedCount = relevantTasks.filter(t => t.status === 'COMPLETED').length
    
    const data = []
    if (todoCount > 0) data.push({ name: 'To Do', value: todoCount, color: '#9ca3af' })
    if (inProgressCount > 0) data.push({ name: 'In Progress', value: inProgressCount, color: '#0ea5e9' })
    if (completedCount > 0) data.push({ name: 'Completed', value: completedCount, color: '#22c55e' })
    return data
  }, [dashboard, allTasks, isAdmin])

  // Project progress with calculated percentage from tasks
  const projectProgress = useMemo(() => {
    const myProjectIds = isAdmin 
      ? allProjects.map(p => p.id)
      : (dashboard?.recentProjects || []).map(p => p.id)
    
    const projectsWithProgress = myProjectIds.map(projectId => {
      const project = allProjectMap[projectId]
      if (!project) return null
      
      const projectTasks = allTasks.filter(t => t.projectId === projectId)
      const totalTasks = projectTasks.length
      const completedTasks = projectTasks.filter(t => t.status === 'COMPLETED').length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : null
      
      return { ...project, totalTasks, completedTasks, progress }
    }).filter(Boolean)
    
    return projectsWithProgress.slice(0, 5)
  }, [allProjects, allTasks, allProjectMap, dashboard, isAdmin])

  // Upcoming deadlines - combine project and task deadlines
  const upcomingDeadlines = useMemo(() => {
    const today = new Date()
    const items = []
    
    // Add project deadlines
    const relevantProjects = isAdmin ? allProjects : (dashboard?.recentProjects || [])
    relevantProjects.forEach(project => {
      const deadline = new Date(project.deadline)
      const isOverdue = deadline < today && project.status !== 'COMPLETED'
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
      
      items.push({
        type: 'project',
        id: project.id,
        name: project.title,
        deadline: project.deadline,
        status: project.status,
        isOverdue,
        daysUntil,
        assignees: project.assignedInternIds?.length || 0,
      })
    })
    
    // Add task deadlines
    const relevantTasks = isAdmin ? allTasks : (dashboard?.recentTasks || [])
    relevantTasks.forEach(task => {
      const deadline = new Date(task.deadline)
      const isOverdue = deadline < today && task.status !== 'COMPLETED'
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
      
      items.push({
        type: 'task',
        id: task.id,
        name: task.title,
        projectName: allProjectMap[task.projectId]?.title || '-',
        deadline: task.deadline,
        status: task.status,
        isOverdue,
        daysUntil,
        assignee: userMap[task.assignedInternId]?.name || '-',
      })
    })
    
    // Sort by deadline (nearest first), overdue items first
    return items
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1
        if (!a.isOverdue && b.isOverdue) return 1
        return new Date(a.deadline) - new Date(b.deadline)
      })
      .slice(0, 8)
  }, [allProjects, allTasks, dashboard, allProjectMap, userMap, isAdmin])

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
          {isAdmin ? 'Overview of internship management activity' : `Welcome back, ${user?.name || 'Intern'}`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Task Completion Donut Chart & Project Progress */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Task Completion Chart */}
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">
              Task Completion Overview
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {isAdmin ? 'All tasks across projects' : 'Your assigned tasks'}
            </p>
          </div>
          <div className="p-6 flex items-center justify-center" style={{ minHeight: '280px' }}>
            {chartData.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                  pie_chart
                </span>
                <p className="text-sm text-gray-400">No task data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} task${value !== 1 ? 's' : ''}`, 'Status']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Project Progress */}
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">
              Project Progress
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Completion based on finished tasks
            </p>
          </div>
          <div className="p-6 space-y-5 max-h-[320px] overflow-y-auto">
            {projectProgress.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                  folder_off
                </span>
                <p className="text-sm text-gray-400">No projects yet</p>
              </div>
            ) : (
              projectProgress.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {project.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {project.completedTasks || 0} of {project.totalTasks} tasks completed
                      </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        project.progress === 100 ? 'bg-green-100 text-green-700' :
                        project.progress >= 50 ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {project.progress !== null ? `${project.progress}%` : 'No tasks'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        project.progress === 100 ? 'bg-green-500' :
                        project.progress >= 50 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: project.progress !== null ? `${project.progress}%` : '0%' }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines & Recent Projects/Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Deadlines
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Projects and tasks sorted by due date
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200/50">
                  <th className="py-3 px-6">Item</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Deadline</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {upcomingDeadlines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                        event_busy
                      </span>
                      <p className="text-sm text-gray-400">No upcoming deadlines</p>
                    </td>
                  </tr>
                ) : (
                  upcomingDeadlines.map((item) => (
                    <tr
                      key={`${item.type}-${item.id}`}
                      className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors ${
                        item.isOverdue ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-6 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-gray-400">
                            {item.type === 'project' ? 'folder' : 'task'}
                          </span>
                          <div>
                            <p className="truncate max-w-[200px]">{item.name}</p>
                            {item.type === 'task' && (
                              <p className="text-xs text-gray-500">{item.projectName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          item.type === 'project' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.type === 'project' ? 'Project' : 'Task'}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${item.isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {item.deadline}
                          </span>
                          {item.isOverdue && (
                            <span className="material-symbols-outlined text-red-500 text-[16px]" title="Overdue">
                              warning
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          statusBadge[item.status] || 'bg-gray-100 text-gray-600'
                        }`}>
                          {statusLabel[item.status] || item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-200/50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {isAdmin ? 'Recent Projects' : 'My Projects'}
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
              {isAdmin ? 'Recent Tasks' : 'My Tasks'}
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
