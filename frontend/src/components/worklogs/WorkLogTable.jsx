import UserAvatar from '../common/UserAvatar'

function WorkLogTable({ workLogs, userMap, onEdit, onDelete, isAdmin }) {
  return (
    <div className="bg-white border border-gray-200/50 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200/50">
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Date</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Hours</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Work</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Current Work</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Challenges</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Next Day Plan</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-300 mb-2 block">history</span>
                  <p className="text-sm text-gray-400">No work logs found</p>
                </td>
              </tr>
            ) : (
              workLogs.map((log) => {
                const intern = userMap?.[log.internId]
                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={intern} size="w-8 h-8" textSize="text-[10px]" />
                        <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{intern?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-sm text-gray-500 whitespace-nowrap">{log.date}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                        {log.hoursWorked} hrs
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-700 line-clamp-2" title={log.completedWork}>{log.completedWork || '-'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-500 line-clamp-2" title={log.currentWork}>{log.currentWork || '--'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-500 line-clamp-2" title={log.challenges}>{log.challenges || '--'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-sm text-gray-500 line-clamp-2" title={log.nextDayPlan}>{log.nextDayPlan || '--'}</p>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEdit(log)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit log">
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {isAdmin && (
                          <button onClick={() => onDelete(log)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete log">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
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

export default WorkLogTable
