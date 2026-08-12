import { useState, useEffect, useCallback } from 'react'
import { getFeedback, addFeedback } from '../../services/feedbackService'

const decisionConfig = {
  APPROVED: {
    label: 'Approved',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'check_circle',
    iconColor: 'text-green-500',
  },
  CHANGES_REQUIRED: {
    label: 'Changes Required',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'edit_note',
    iconColor: 'text-amber-500',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'cancel',
    iconColor: 'text-red-500',
  },
}

function FeedbackModal({ isOpen, onClose, task, isAdmin, onFeedbackAdded }) {
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Add feedback form state
  const [comment, setComment] = useState('')
  const [decision, setDecision] = useState('APPROVED')
  const [formErrors, setFormErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const fetchFeedback = useCallback(async () => {
    if (!task?.id) return
    try {
      setLoading(true)
      setError(null)
      const response = await getFeedback(task.id)
      setFeedbackList(response.data)
    } catch (err) {
      setError('Unable to load feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [task?.id])

  useEffect(() => {
    if (isOpen && task?.id) {
      fetchFeedback()
      // Reset form state when opening
      setComment('')
      setDecision('APPROVED')
      setFormErrors({})
      setServerError('')
      setSuccessMessage('')
    }
  }, [isOpen, task?.id, fetchFeedback])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const validate = () => {
    const errors = {}
    if (!comment.trim()) {
      errors.comment = 'Comment is required'
    } else if (comment.trim().length < 3) {
      errors.comment = 'Comment must be at least 3 characters'
    }
    if (!decision) {
      errors.decision = 'Decision is required'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    setSuccessMessage('')
    if (!validate()) return

    try {
      setSubmitting(true)
      await addFeedback(task.id, {
        comment: comment.trim(),
        decision,
      })
      setComment('')
      setDecision('APPROVED')
      setFormErrors({})
      setSuccessMessage('Feedback added successfully.')
      // Refresh feedback list
      await fetchFeedback()
      // Notify parent to update feedback count in the table
      if (onFeedbackAdded) {
        onFeedbackAdded(task.id)
      }
      // Auto-dismiss success after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to add feedback. Please try again.'
      setServerError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              Feedback
            </h3>
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {task?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close feedback panel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Feedback History */}
          <div className="px-6 py-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-gray-400">
                history
              </span>
              Feedback History
              {!loading && !error && (
                <span className="text-xs text-gray-400 font-normal">
                  ({feedbackList.length})
                </span>
              )}
            </h4>

            {/* Loading State */}
            {loading && (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300 animate-spin block mb-2">
                  progress_activity
                </span>
                <p className="text-sm text-gray-400">Loading feedback...</p>
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <span className="material-symbols-outlined text-2xl text-red-400 block mb-1">
                  error
                </span>
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <button
                  onClick={fetchFeedback}
                  className="text-sm font-medium text-red-700 hover:text-red-800 underline"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && feedbackList.length === 0 && (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">
                  rate_review
                </span>
                <p className="text-sm text-gray-400">
                  No feedback yet.
                </p>
                {isAdmin && (
                  <p className="text-xs text-gray-400 mt-1">
                    Add the first feedback for this task.
                  </p>
                )}
              </div>
            )}

            {/* Feedback Items */}
            {!loading && !error && feedbackList.length > 0 && (
              <div className="space-y-3">
                {feedbackList.map((item, index) => {
                  const dc =
                    decisionConfig[item.decision] || decisionConfig.APPROVED
                  return (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 ${dc.bg} ${dc.border}`}
                    >
                      {/* Decision badge + date */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${dc.bg} ${dc.text}`}
                        >
                          <span
                            className={`material-symbols-outlined text-[14px] ${dc.iconColor}`}
                          >
                            {dc.icon}
                          </span>
                          {dc.label}
                        </span>
                        {item.date && (
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatDate(item.date)}
                          </span>
                        )}
                      </div>
                      {/* Comment */}
                      {item.comment && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {item.comment}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Add Feedback Form - ADMIN only */}
          {isAdmin && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-gray-400">
                  add_comment
                </span>
                Add Feedback
              </h4>

              {/* Success Message */}
              {successMessage && (
                <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <span className="material-symbols-outlined text-[16px]">
                    check_circle
                  </span>
                  {successMessage}
                </div>
              )}

              {/* Server Error */}
              {serverError && (
                <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <span className="material-symbols-outlined text-[16px]">
                    error
                  </span>
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Decision */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => {
                      setDecision(e.target.value)
                      if (formErrors.decision)
                        setFormErrors((prev) => ({ ...prev, decision: '' }))
                    }}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      formErrors.decision
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <option value="APPROVED">Approved</option>
                    <option value="CHANGES_REQUIRED">Changes Required</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  {formErrors.decision && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.decision}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Comment
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value)
                      if (formErrors.comment)
                        setFormErrors((prev) => ({ ...prev, comment: '' }))
                    }}
                    rows={3}
                    placeholder="Write your feedback for this task..."
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
                      formErrors.comment
                        ? 'border-red-400 bg-red-50/50'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                  {formErrors.comment && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.comment}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && (
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                    )}
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer - Close button */}
        <div className="px-6 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
