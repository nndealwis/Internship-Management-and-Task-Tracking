function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const statusConfig = {
  IN_PROGRESS: {
    label: 'In Progress',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700',
  },
  PLANNED: {
    label: 'Planned',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-green-500',
    badge: 'bg-green-50 text-green-700',
  },
}

function ProjectTable({ projects, userMap, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200/50">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Technology
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Interns
              </th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">
                    folder
                  </span>
                  <p className="text-sm text-gray-400">No projects found</p>
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const status = statusConfig[project.status] || statusConfig.PLANNED
                const internIds = project.assignedInternIds || []
                const displayInterns = internIds.slice(0, 2)
                const overflow = internIds.length - 2

                return (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {project.title}
                      </div>
                      {project.description && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                          {project.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technology?.split(',').map((tech, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {project.deadline}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.badge}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                        />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {internIds.length === 0 ? (
                        <span className="text-xs text-gray-400">None</span>
                      ) : (
                        <div className="flex -space-x-2">
                          {displayInterns.map((id) => {
                            const user = userMap?.[id]
                            const initials = getInitials(user?.name)
                            return (
                              <div
                                key={id}
                                className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center flex-shrink-0"
                                title={user?.name || id}
                              >
                                <span className="text-[10px] font-medium text-gray-600">
                                  {initials}
                                </span>
                              </div>
                            )
                          })}
                          {overflow > 0 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0 z-10">
                              <span className="text-[10px] font-medium text-gray-600">
                                +{overflow}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEdit(project)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit project"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => onDelete(project)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete project"
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

export default ProjectTable
