import { useState, useEffect, useMemo } from 'react'
import { getTasks, createTask, updateTask, deleteTask } from '../../services/taskService'
import { getProjects } from '../../services/projectService'
import { getUsers } from '../../services/userService'
import TaskTable from '../../components/tasks/TaskTable'
import TaskFormModal from '../../components/tasks/TaskFormModal'
import DeleteDialog from '../../components/common/DeleteDialog'

function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const projectMap = useMemo(() => {
    const map = {}
    projects.forEach((p) => { map[p.id] = p.title })
    return map
  }, [projects])

  const userMap = useMemo(() => {
    const map = {}
    users.forEach((u) => { map[u.id] = u })
    return map
  }, [users])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        getTasks(),
        getProjects(),
        getUsers(),
      ])
      setTasks(tasksRes.data)
      setProjects(projectsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredTasks = useMemo(() => {
    const query = search.toLowerCase()
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      const matchesProject = !filterProject || task.projectId === filterProject
      const matchesStatus = !filterStatus || task.status === filterStatus
      const matchesPriority = !filterPriority || task.priority === filterPriority
      return matchesSearch && matchesProject && matchesStatus && matchesPriority
    })
  }, [tasks, search, filterProject, filterStatus, filterPriority])

  const handleCreate = () => {
    setSelectedTask(null)
    setIsFormOpen(true)
  }

  const handleEdit = (task) => {
    setSelectedTask(task)
    setIsFormOpen(true)
  }

  const handleDelete = (task) => {
    setTaskToDelete(task)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask.id, formData)
      } else {
        await createTask(formData)
      }
      setIsFormOpen(false)
      setSelectedTask(null)
      await fetchData()
    } catch (err) {
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteTask(taskToDelete.id)
      setIsDeleteOpen(false)
      setTaskToDelete(null)
      await fetchData()
    } catch (err) {
      setError('Failed to delete task. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Tasks
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Track internship tasks, progress, deadlines, and submissions
        </p>
      </div>

      <div className="bg-white border border-gray-200/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVISION_REQUIRED">Revision Required</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <button
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Task
          </button>
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
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1" />
                <div className="h-5 w-16 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          projectMap={projectMap}
          userMap={userMap}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedTask(null) }}
        onSubmit={handleFormSubmit}
        task={selectedTask}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setTaskToDelete(null) }}
        onConfirm={handleConfirmDelete}
        itemName={taskToDelete?.title}
      />
    </div>
  )
}

export default TasksPage
