import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProjectById } from '../../services/projectService'
import { getTasksByProjectId, createTask, updateTask, deleteTask } from '../../services/taskService'
import { getUsers } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import UserAvatar from '../../components/common/UserAvatar'
import TaskTable from '../../components/tasks/TaskTable'
import TaskFormModal from '../../components/tasks/TaskFormModal'
import DeleteDialog from '../../components/common/DeleteDialog'

const statusConfig = {
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  PLANNED: { label: 'Planned', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
  COMPLETED: { label: 'Completed', dot: 'bg-green-500', badge: 'bg-green-50 text-green-700' },
}

function ProjectDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const isAdmin = user?.role === 'ADMIN'

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  const projectMap = useMemo(() => {
    const map = {}
    if (project) map[project.id] = project.title
    return map
  }, [project])

  const userMap = useMemo(() => {
    const map = {}
    users.forEach((u) => { map[u.id] = u })
    return map
  }, [users])

  const projectInterns = useMemo(() => {
    if (!project?.assignedInternIds || users.length === 0) return []
    return users.filter((u) => project.assignedInternIds.includes(u.id))
  }, [project, users])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [projectRes, tasksRes] = await Promise.all([
        getProjectById(id),
        getTasksByProjectId(id),
      ])
      setProject(projectRes.data)
      setTasks(tasksRes.data)
      if (isAdmin) {
        try {
          const usersRes = await getUsers()
          setUsers(usersRes.data)
        } catch {
          // ignore
        }
      } else {
        // For intern, we still need user data to display names
        // The backend will filter, but we need the user map for display
        try {
          const usersRes = await getUsers()
          setUsers(usersRes.data)
        } catch {
          // ignore
        }
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have access to this project.')
      } else if (err.response?.status === 404) {
        setError('Project not found.')
      } else {
        setError('Failed to load project details. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id, isAdmin])

  const handleCreateTask = () => {
    setSelectedTask(null)
    setIsTaskFormOpen(true)
  }

  const handleEditTask = (task) => {
    setSelectedTask(task)
    setIsTaskFormOpen(true)
  }

  const handleDeleteTask = (task) => {
    setTaskToDelete(task)
    setIsDeleteOpen(true)
  }

  const handleStatusUpdate = async (task, newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus })
      await fetchData()
      addToast('Task status updated')
    } catch (err) {
      setError('Failed to update task status.')
    }
  }

  const handleTaskFormSubmit = async (formData) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, formData)
        addToast('Task updated successfully')
      } else {
        await createTask(formData)
        addToast('Task created successfully')
      }
      setIsTaskFormOpen(false)
      setSelectedTask(null)
      await fetchData()
    } catch (err) {
      throw err
    }
  }

  const handleConfirmDeleteTask = async () => {
    try {
      await deleteTask(taskToDelete.id)
      setIsDeleteOpen(false)
      setTaskToDelete(null)
      await fetchData()
      addToast('Task deleted successfully')
    } catch (err) {
      setError('Failed to delete task. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-60 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Projects
        </button>
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
      </div>
    )
  }

  if (!project) return null

  const status = statusConfig[project.status] || statusConfig.PLANNED

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-gray-500 mb-3 max-w-2xl">{project.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">code</span>
                {project.technology}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Deadline: {project.deadline}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">assignment</span>
                {tasks.length} task{tasks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          {isAdmin && (
            <Link
              to="/projects"
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2 self-start"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Projects
            </Link>
          )}
        </div>
      </div>

      {/* Assigned Interns */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Interns</h2>
        {projectInterns.length === 0 ? (
          <p className="text-sm text-gray-400">No interns assigned to this project.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {projectInterns.map((intern) => (
              <div
                key={intern.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <UserAvatar user={intern} size="w-10 h-10" textSize="text-sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{intern.name}</p>
                  <p className="text-xs text-gray-500 truncate">{intern.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Tasks */}
      <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
          {isAdmin && (
            <button
              onClick={handleCreateTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Task
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">assignment</span>
            <p className="text-sm text-gray-400 mb-4">No tasks yet for this project.</p>
            {isAdmin && (
              <button
                onClick={handleCreateTask}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Create the first task
              </button>
            )}
          </div>
        ) : (
          <TaskTable
            tasks={tasks}
            projectMap={projectMap}
            userMap={userMap}
            onEdit={isAdmin ? handleEditTask : undefined}
            onDelete={isAdmin ? handleDeleteTask : undefined}
            onStatusUpdate={!isAdmin ? handleStatusUpdate : undefined}
            isAdmin={isAdmin}
            hideProjectColumn
          />
        )}
      </div>

      {/* Task Form Modal */}
      {isAdmin && (
        <>
          <TaskFormModal
            isOpen={isTaskFormOpen}
            onClose={() => { setIsTaskFormOpen(false); setSelectedTask(null) }}
            onSubmit={handleTaskFormSubmit}
            task={selectedTask}
            defaultProjectId={id}
            projectInterns={projectInterns}
          />

          <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => { setIsDeleteOpen(false); setTaskToDelete(null) }}
            onConfirm={handleConfirmDeleteTask}
            itemName={taskToDelete?.title}
          />
        </>
      )}
    </div>
  )
}

export default ProjectDetailsPage
