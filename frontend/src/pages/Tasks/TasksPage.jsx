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
      setError('Operation failed. Please try again.')
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <p className="text-sm text-gray-500">Manage internship tasks</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          Loading tasks...
        </div>
      ) : (
        <TaskTable
          tasks={filteredTasks}
          projects={projects}
          users={users}
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
