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

function WorkLogFormModal({ isOpen, onClose, onSubmit, workLog, isAdmin, currentUser }) {
  const [form, setForm] = useState(initialForm)
  const [interns, setInterns] = useState([])
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isEditing = !!workLog

  useEffect(() => {
    if (isOpen && isAdmin) {
      getUsers()
        .then((res) => {
          setInterns(res.data.filter((u) => u.role === 'INTERN'))
        })
        .catch(() => setInterns([]))
    }
  }, [isOpen, isAdmin])

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
      setForm({
        ...initialForm,
        internId: isAdmin ? '' : currentUser?.userId || '',
      })
    }
    setErrors({})
    setServerError('')
  }, [workLog, isOpen, isAdmin, currentUser])

  const validate = () => {
    const newErrors = {}
    if (!isAdmin && !form.internId) {
      // internId will be set automatically
    } else if (isAdmin && !form.internId) {
      newErrors.internId = 'Intern is required'
    }
    if (!form.date) newErrors.date = 'Date is required'
    if (!form.completedWork.trim()) newErrors.completedWork = 'Completed work is required'
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      setSubmitting(true)
      const payload = { ...form }
      if (!isAdmin) {
        payload.internId = currentUser?.userId
      }
      await onSubmit(payload)
    } catch (err) {
      const message = err.response?.data?.message || 'Operation failed. Please try again.'
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ' +
    (errors[field] ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white')

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Work Log' : 'Add Work Log'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {serverError}
          </div>
        )}

        {isAdmin && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Intern</label>
              <select name="internId" value={form.internId} onChange={handleChange} className={inputClass('internId')}>
                <option value="">Select intern</option>
                {interns.map((intern) => (
                  <option key={intern.id} value={intern.id}>{intern.name}</option>
                ))}
              </select>
              {errors.internId && <p className="mt-1 text-xs text-red-500">{errors.internId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass('date')} />
              {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className={inputClass('date')} />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Completed Work</label>
          <textarea name="completedWork" value={form.completedWork} onChange={handleChange} rows={2}
            placeholder="What did you complete today?"
            className={'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ' + (errors.completedWork ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white')} />
          {errors.completedWork && <p className="mt-1 text-xs text-red-500">{errors.completedWork}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Work</label>
          <textarea name="currentWork" value={form.currentWork} onChange={handleChange} rows={2}
            placeholder="What are you currently working on?"
            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Challenges</label>
          <textarea name="challenges" value={form.challenges} onChange={handleChange} rows={2}
            placeholder="Any blockers or challenges?"
            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Hours Worked</label>
            <input type="number" name="hoursWorked" value={form.hoursWorked} onChange={handleChange}
              min="0" step="0.5" placeholder="8"
              className={inputClass('hoursWorked')} />
            {errors.hoursWorked && <p className="mt-1 text-xs text-red-500">{errors.hoursWorked}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Next Day Plan</label>
            <textarea name="nextDayPlan" value={form.nextDayPlan} onChange={handleChange} rows={2}
              placeholder="What's planned for tomorrow?"
              className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors" />
          </div>
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

export default WorkLogFormModal
