import { useState } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import FeedbackModal from './FeedbackModal'
import UserAvatar from '../common/UserAvatar'

const priorityConfig = {
  HIGH: { label: 'High', bg: 'bg-red-100', text: 'text-red-700' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-100', text: 'text-amber-700' },
  LOW: { label: 'Low', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const statusConfig = {
  TODO: { label: 'To Do', bg: 'bg-gray-100', text: 'text-gray-700', color: '#9ca3af' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', color: '#0ea5e9' },
  COMPLETED: { label: 'Completed', bg: 'bg-green-50', text: 'text-green-700', color: '#22c55e' },
}

const columnOrder = ['TODO', 'IN_PROGRESS', 'COMPLETED']

function TaskCard({ task, projectMap, userMap, onEdit, onDelete, onStatusUpdate, isAdmin }) {
  const [feedbackTask, setFeedbackTask] = useState(null)
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const intern = userMap?.[task.assignedInternId]
  const pri = priorityConfig[task.priority] || priorityConfig.LOW
  const st = statusConfig[task.status] || statusConfig.TODO

  const handleFeedbackClick = (e) => {
    e.stopPropagation()
    setFeedbackTask(task)
  }

  const handleFeedbackClose = () => {
    setFeedbackTask(null)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-white border border-gray-200/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1 pr-2">
            {task.title}
          </h4>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${pri.bg} ${pri.text} flex-shrink-0`}>
            {pri.label}
          </span>
        </div>

        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {task.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-gray-400">folder</span>
            <span className="text-xs text-gray-600 truncate">{projectMap[task.projectId] || '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <UserAvatar user={intern} size="w-5 h-5" textSize="text-[8px]" />
            <span className="text-xs text-gray-600">{intern?.name || '-'}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-gray-400">calendar_today</span>
            <span className={`text-xs ${new Date(task.deadline) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              {task.deadline}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          {!isAdmin && onStatusUpdate ? (
            <select
              value={task.status}
              onChange={(e) => {
                e.stopPropagation()
                onStatusUpdate(task, e.target.value)
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-semibold px-2 py-1 rounded border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-700"
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

          {isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleFeedbackClick}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Add feedback"
              >
                <span className="material-symbols-outlined text-[16px]">rate_review</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(task) }}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(task) }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <FeedbackModal
        isOpen={!!feedbackTask}
        onClose={handleFeedbackClose}
        task={feedbackTask}
        isAdmin={isAdmin}
      />
    </>
  )
}

function SortableTaskList({ tasks, projectMap, userMap, onEdit, onDelete, onStatusUpdate, isAdmin }) {
  return (
    <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
      <div className="space-y-3 min-h-[100px]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            projectMap={projectMap}
            userMap={userMap}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusUpdate={onStatusUpdate}
            isAdmin={isAdmin}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <span className="material-symbols-outlined text-3xl text-gray-300 mb-1 block">assignment</span>
            <p className="text-xs text-gray-400">No tasks</p>
          </div>
        )}
      </div>
    </SortableContext>
  )
}

function KanbanColumn({ status, title, tasks, projectMap, userMap, onEdit, onDelete, onStatusUpdate, isAdmin, color }) {
  return (
    <div className="bg-gray-50/50 rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SortableTaskList
          tasks={tasks}
          projectMap={projectMap}
          userMap={userMap}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}

function TaskKanban({ tasks, projectMap, userMap, onEdit, onDelete, onStatusUpdate, isAdmin }) {
  const [draggedTask, setDraggedTask] = useState(null)

  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // Find the task being dragged
    const task = tasks.find(t => t.id === activeId)
    if (!task) return

    // Determine target status from the drop zone
    let newStatus = task.status
    
    // Check if dropped on another task
    const overTask = tasks.find(t => t.id === overId)
    if (overTask) {
      newStatus = overTask.status
    } else {
      // Check if dropped directly on a column
      const columnIds = ['TODO', 'IN_PROGRESS', 'COMPLETED']
      if (columnIds.includes(overId)) {
        newStatus = overId
      }
    }

    // Only update if status changed
    if (newStatus !== task.status) {
      setDraggedTask({ task, originalStatus: task.status })
      try {
        await onStatusUpdate(task, newStatus)
      } catch (error) {
        // Revert on error - handled by parent
        console.error('Failed to update task status:', error)
      } finally {
        setDraggedTask(null)
      }
    }
  }

  const tasksByStatus = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED'),
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <KanbanColumn
          status="TODO"
          title="To Do"
          tasks={tasksByStatus.TODO}
          projectMap={projectMap}
          userMap={userMap}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          isAdmin={isAdmin}
          color={statusConfig.TODO.color}
        />
        <KanbanColumn
          status="IN_PROGRESS"
          title="In Progress"
          tasks={tasksByStatus.IN_PROGRESS}
          projectMap={projectMap}
          userMap={userMap}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          isAdmin={isAdmin}
          color={statusConfig.IN_PROGRESS.color}
        />
        <KanbanColumn
          status="COMPLETED"
          title="Completed"
          tasks={tasksByStatus.COMPLETED}
          projectMap={projectMap}
          userMap={userMap}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusUpdate={onStatusUpdate}
          isAdmin={isAdmin}
          color={statusConfig.COMPLETED.color}
        />
      </div>
    </DndContext>
  )
}

export default TaskKanban
