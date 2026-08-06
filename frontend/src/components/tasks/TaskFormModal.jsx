import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { getProjects } from '../../services/projectService'
import { getUsers } from '../../services/userService'

const initialForm = {
  title: '',
  description: '',
  projectId: '',
  assignedInternId: '',
  priority: 'LOW',
  deadline: '',
  status: 'TODO',
}

function TaskFormModal({ isOpen, onClose, onSubmit, task }) {
  const [form, setForm] = useState(initialForm)
  const [projects, setProjects] = useState([])
  const [interns, setInterns] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const isEditing = !!task

  useEffect(() => {
    if (isOpen) {
      Promise.all([getProjects(), getUsers()])
        .then(([projRes, userRes]) => {
          setProjects(projRes.data)
          setInterns(userRes.data.filter((u) => u.role === 'INTERN'))
        })
        .catch(() => {
          setProjects([])
          setInterns([])
        })
    }
  }, [isOpen])

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        projectId: task.projectId || '',
        assignedInternId: task.assignedInternId || '',
        priority: task.priority || 'LOW',
        deadline: task.deadline || '',
        status: task.status || 'TODO',
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
    setServerError('')
  }, [task, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!form.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!form.projectId) {
      newErrors.projectId = 'Project is required'
    }
    if (!form.assignedInternId) {
      newErrors.assignedInternId = 'Assigned intern is required'
    }
    if (!form.priority) {
      newErrors.priority = 'Priority is required'
    }
    if (!form.deadline) {
      newErrors.deadline = 'Deadline is required'
    }
    if (!form.status) {
      newErrors.status = 'Status is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    try {
      await onSubmit(form)
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed. Please try again.'
      setServerError(message)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {serverError}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.projectId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Intern</label>
            <select
              name="assignedInternId"
              value={form.assignedInternId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.assignedInternId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select intern</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.name}</option>
              ))}
            </select>
            {errors.assignedInternId && <p className="mt-1 text-xs text-red-600">{errors.assignedInternId}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.priority ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            {errors.priority && <p className="mt-1 text-xs text-red-600">{errors.priority}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.deadline ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.deadline && <p className="mt-1 text-xs text-red-600">{errors.deadline}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskFormModal
