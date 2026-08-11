function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const priorityConfig = {
  HIGH: { label: 'High', bg: 'bg-red-100', text: 'text-red-700' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700' },
  LOW: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const statusConfig = {
  TODO: { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700' },
  SUBMITTED: { label: 'Submitted', bg: 'bg-purple-50', text: 'text-purple-700' },
  REVISION_REQUIRED: { label: 'Revision Required', bg: 'bg-amber-50', text: 'text-amber-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700' },
}

function TaskTable({ tasks, projectMap, userMap, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200/50">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
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
                <td colSpan={8} className="px-6 py-12 text-center">
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
                const feedbackCount = task.feedback?.length || 0

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
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {projectMap[task.projectId] || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-medium text-gray-600">
                            {getInitials(intern?.name)}
                          </span>
                        </div>
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${st.bg} ${st.text}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="material-symbols-outlined text-[16px]">
                          chat
                        </span>
                        <span className="text-xs font-medium">{feedbackCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit task"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete(task)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete task"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TaskTable
