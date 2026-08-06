function WorkLogTable({ workLogs, users, onEdit, onDelete }) {
  const getInternName = (internId) => {
    const user = users.find((u) => u.id === internId)
    return user?.name || '-'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 font-medium">Intern</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Hours</th>
              <th className="px-6 py-3 font-medium">Completed Work</th>
              <th className="px-6 py-3 font-medium">Current Work</th>
              <th className="px-6 py-3 font-medium">Challenges</th>
              <th className="px-6 py-3 font-medium">Next Day Plan</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workLogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                  No work logs found.
                </td>
              </tr>
            ) : (
              workLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{getInternName(log.internId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.hoursWorked}h</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={log.completedWork}>{log.completedWork}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={log.currentWork}>{log.currentWork}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={log.challenges}>{log.challenges}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={log.nextDayPlan}>{log.nextDayPlan}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onEdit(log)}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(log)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default WorkLogTable
