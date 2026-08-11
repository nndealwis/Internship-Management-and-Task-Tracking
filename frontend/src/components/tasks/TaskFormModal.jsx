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

function TaskFormModal({ isOpen, onClose, onSubmit, task, defaultProjectId, projectInterns }) {
  const [form, setForm] = useState(initialForm)
  const [projects, setProjects] = useState([])
  const [interns, setInterns] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isEditing = !!task
  const isProjectContext = !!defaultProjectId

  useEffect(() => {
    if (isOpen) {
      if (isProjectContext && projectInterns) {
        setInterns(projectInterns)
        setProjects([])
      } else {
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
    }
  }, [isOpen, isProjectContext, projectInterns])

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
    } else if (isProjectContext) {
      setForm({
        ...initialForm,
        projectId: defaultProjectId,
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
    setServerError('')
  }, [task, isOpen, isProjectContext, defaultProjectId])

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.projectId) newErrors.projectId = 'Project is required'
    if (!form.assignedInternId) newErrors.assignedInternId = 'Assigned intern is required'
    if (!form.priority) newErrors.priority = 'Priority is required'
    if (!form.deadline) newErrors.deadline = 'Deadline is required'
    if (!form.status) newErrors.status = 'Status is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      setSubmitting(true)
      await onSubmit(form)
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed. Please try again.'
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      errors[field] ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white'
    }`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {serverError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange}
            placeholder="Enter task title" className={inputClass('title')} />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange}
            rows={3} placeholder="Enter task description"
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
              errors.description ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white'
            }`} />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project</label>
            {isProjectContext ? (
              <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-700">
                {projects.length > 0 ? projects.find(p => p.id === form.projectId)?.title || form.projectId : form.projectId}
              </div>
            ) : (
              <select name="projectId" value={form.projectId} onChange={handleChange} className={inputClass('projectId')}>
                <option value="">Select project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            )}
            {errors.projectId && <p className="mt-1 text-xs text-red-500">{errors.projectId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Intern</label>
            <select name="assignedInternId" value={form.assignedInternId} onChange={handleChange} className={inputClass('assignedInternId')}>
              <option value="">Select intern</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.name}</option>
              ))}
            </select>
            {errors.assignedInternId && <p className="mt-1 text-xs text-red-500">{errors.assignedInternId}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className={inputClass('priority')}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
            {errors.priority && <p className="mt-1 text-xs text-red-500">{errors.priority}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className={inputClass('deadline')} />
            {errors.deadline && <p className="mt-1 text-xs text-red-500">{errors.deadline}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={inputClass('status')}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {submitting && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskFormModal
