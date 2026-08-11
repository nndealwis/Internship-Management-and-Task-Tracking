import { useState } from 'react'
import FeedbackModal from './FeedbackModal'
import UserAvatar from '../common/UserAvatar'

const priorityConfig = {
  HIGH: { label: 'High', bg: 'bg-red-100', text: 'text-red-700' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700' },
  LOW: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const statusConfig = {
  TODO: { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700' },
}

function TaskTable({ tasks, projectMap, userMap, onEdit, onDelete, onStatusUpdate, isAdmin, hideProjectColumn }) {
  const [feedbackTask, setFeedbackTask] = useState(null)
  const [localFeedbackCounts, setLocalFeedbackCounts] = useState({})

  const handleFeedbackClick = (task) => {
    setFeedbackTask(task)
  }

  const handleFeedbackClose = () => {
    setFeedbackTask(null)
  }

  const handleFeedbackAdded = (taskId) => {
    // Increment the local feedback count so the table updates immediately
    setLocalFeedbackCounts((prev) => ({
      ...prev,
      [taskId]: (prev[taskId] ?? (tasks.find((t) => t.id === taskId)?.feedback?.length || 0)) + 1,
    }))
  }

  const getFeedbackCount = (task) => {
    if (localFeedbackCounts[task.id] !== undefined) {
      return localFeedbackCounts[task.id]
    }
    return task.feedback?.length || 0
  }

  return (
    <>
      <div className="bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/50">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
                </th>
                {!hideProjectColumn && (
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                )}
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Intern
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={hideProjectColumn ? 7 : 8} className="px-6 py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                      assignment
                    </span>
                    <p className="text-sm text-gray-400">No tasks found</p>
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const pri = priorityConfig[task.priority] || priorityConfig.LOW
                  const st = statusConfig[task.status] || statusConfig.TODO
                  const intern = userMap?.[task.assignedInternId]
                  const feedbackCount = getFeedbackCount(task)

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {task.title}
                        </span>
                      </td>
                      {!hideProjectColumn && (
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {projectMap[task.projectId] || '-'}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <UserAvatar user={intern} size="w-6 h-6" textSize="text-[9px]" />
                          <span className="text-sm text-gray-700">
                            {intern?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${pri.bg} ${pri.text}`}>
                          {pri.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">
                          {task.deadline}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!isAdmin && onStatusUpdate ? (
                          <select
                            value={task.status}
                            onChange={(e) => onStatusUpdate(task, e.target.value)}
                            className={`text-[10px] font-semibold px-2 py-1 rounded border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${st.bg} ${st.text}`}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleFeedbackClick(task)}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                          aria-label={`View feedback for ${task.title}`}
                          title="View feedback"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            chat
                          </span>
                          <span className="text-xs font-medium">{feedbackCount}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isAdmin ? (
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleFeedbackClick(task)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Add feedback"
                              aria-label={`Add feedback for ${task.title}`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                rate_review
                              </span>
                            </button>
                            <button
                              onClick={() => onEdit(task)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit task"
                              aria-label={`Edit ${task.title}`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => onDelete(task)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete task"
                              aria-label={`Delete ${task.title}`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                delete
                              </span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">View only</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={!!feedbackTask}
        onClose={handleFeedbackClose}
        task={feedbackTask}
        isAdmin={isAdmin}
        onFeedbackAdded={handleFeedbackAdded}
      />
    </>
  )
}

export default TaskTable
