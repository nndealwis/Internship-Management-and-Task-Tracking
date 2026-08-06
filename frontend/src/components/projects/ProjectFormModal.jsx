import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { getUsers } from '../../services/userService'

const initialForm = {
  title: '',
  description: '',
  technology: '',
  deadline: '',
  status: 'PLANNED',
  assignedInternIds: [],
}

function ProjectFormModal({ isOpen, onClose, onSubmit, project }) {
  const [form, setForm] = useState(initialForm)
  const [users, setUsers] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const isEditing = !!project

  useEffect(() => {
    if (isOpen) {
      getUsers()
        .then((res) => setUsers(res.data))
        .catch(() => setUsers([]))
    }
  }, [isOpen])

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        technology: project.technology || '',
        deadline: project.deadline || '',
        status: project.status || 'PLANNED',
        assignedInternIds: project.assignedInternIds || [],
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
    setServerError('')
  }, [project, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!form.technology.trim()) {
      newErrors.technology = 'Technology is required'
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

  const handleInternToggle = (userId) => {
    setForm((prev) => {
      const ids = prev.assignedInternIds.includes(userId)
        ? prev.assignedInternIds.filter((id) => id !== userId)
        : [...prev.assignedInternIds, userId]
      return { ...prev, assignedInternIds: ids }
    })
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Project' : 'Add Project'}>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technology</label>
            <input
              type="text"
              name="technology"
              value={form.technology}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.technology ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.technology && <p className="mt-1 text-xs text-red-600">{errors.technology}</p>}
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
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Interns</label>
          <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
            {users.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500">No users available.</p>
            ) : (
              users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={form.assignedInternIds.includes(user.id)}
                    onChange={() => handleInternToggle(user.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-400">({user.email})</span>
                </label>
              ))
            )}
          </div>
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

export default ProjectFormModal
