import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { getUsers } from '../../services/userService'

const initialForm = {
  internId: '',
  date: '',
  completedWork: '',
  currentWork: '',
  challenges: '',
  hoursWorked: '',
  nextDayPlan: '',
}

function WorkLogFormModal({ isOpen, onClose, onSubmit, workLog }) {
  const [form, setForm] = useState(initialForm)
  const [interns, setInterns] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const isEditing = !!workLog

  useEffect(() => {
    if (isOpen) {
      getUsers()
        .then((res) => {
          setInterns(res.data.filter((u) => u.role === 'INTERN'))
        })
        .catch(() => setInterns([]))
    }
  }, [isOpen])

  useEffect(() => {
    if (workLog) {
      setForm({
        internId: workLog.internId || '',
        date: workLog.date || '',
        completedWork: workLog.completedWork || '',
        currentWork: workLog.currentWork || '',
        challenges: workLog.challenges || '',
        hoursWorked: workLog.hoursWorked || '',
        nextDayPlan: workLog.nextDayPlan || '',
      })
    } else {
      setForm(initialForm)
    }
    setErrors({})
    setServerError('')
  }, [workLog, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!form.internId) {
      newErrors.internId = 'Intern is required'
    }
    if (!form.date) {
      newErrors.date = 'Date is required'
    }
    if (!form.completedWork.trim()) {
      newErrors.completedWork = 'Completed work is required'
    }
    if (!form.hoursWorked && form.hoursWorked !== 0) {
      newErrors.hoursWorked = 'Hours worked is required'
    } else if (Number(form.hoursWorked) <= 0) {
      newErrors.hoursWorked = 'Hours worked must be greater than zero'
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Work Log' : 'Add Work Log'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {serverError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intern</label>
            <select
              name="internId"
              value={form.internId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.internId ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select intern</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>{intern.name}</option>
              ))}
            </select>
            {errors.internId && <p className="mt-1 text-xs text-red-600">{errors.internId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed Work</label>
          <textarea
            name="completedWork"
            value={form.completedWork}
            onChange={handleChange}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.completedWork ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.completedWork && <p className="mt-1 text-xs text-red-600">{errors.completedWork}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Work</label>
          <textarea
            name="currentWork"
            value={form.currentWork}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Challenges</label>
          <textarea
            name="challenges"
            value={form.challenges}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
            <input
              type="number"
              name="hoursWorked"
              value={form.hoursWorked}
              onChange={handleChange}
              min="0"
              step="0.5"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.hoursWorked ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.hoursWorked && <p className="mt-1 text-xs text-red-600">{errors.hoursWorked}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Next Day Plan</label>
            <textarea
              name="nextDayPlan"
              value={form.nextDayPlan}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
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

export default WorkLogFormModal
