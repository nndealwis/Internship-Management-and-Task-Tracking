import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, createProject, updateProject, deleteProject } from '../../services/projectService'
import { getTasks } from '../../services/taskService'
import { getUsers } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/common/Toast'
import ProjectTable from '../../components/projects/ProjectTable'
import ProjectFormModal from '../../components/projects/ProjectFormModal'
import DeleteDialog from '../../components/common/DeleteDialog'

function ProjectsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const isAdmin = user?.role === 'ADMIN'
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const userMap = useMemo(() => {
    const map = {}
    users.forEach((u) => { map[u.id] = u })
    return map
  }, [users])

  const taskCountMap = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      map[t.projectId] = (map[t.projectId] || 0) + 1
    })
    return map
  }, [tasks])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const [projectsRes, tasksRes] = await Promise.all([
        getProjects(),
        getTasks(),
      ])
      setProjects(projectsRes.data)
      setTasks(tasksRes.data)
    } catch (err) {
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchProjects()
      if (isAdmin) {
        try {
          const res = await getUsers()
          setUsers(res.data)
        } catch {
          // ignore
        }
      }
    }
    init()
  }, [isAdmin])

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase()
    return projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(query) ||
        project.technology?.toLowerCase().includes(query)
    )
  }, [projects, search])

  const handleCreate = () => {
    setSelectedProject(null)
    setIsFormOpen(true)
  }

  const handleEdit = (project) => {
    setSelectedProject(project)
    setIsFormOpen(true)
  }

  const handleDelete = (project) => {
    setProjectToDelete(project)
    setIsDeleteOpen(true)
  }

  const handleViewDetails = (project) => {
    navigate(`/projects/${project.id}`)
  }

  const handleManageTasks = (project) => {
    navigate(`/projects/${project.id}`)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, formData)
        addToast('Project updated successfully')
      } else {
        await createProject(formData)
        addToast('Project created successfully')
      }
      setIsFormOpen(false)
      setSelectedProject(null)
      await fetchProjects()
    } catch (err) {
      throw err
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteProject(projectToDelete.id)
      setIsDeleteOpen(false)
      setProjectToDelete(null)
      await fetchProjects()
      addToast('Project deleted successfully')
    } catch (err) {
      setError('Failed to delete project. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Projects
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Manage internship projects and assigned interns' : 'View your assigned projects'}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm w-64 transition-all"
            />
          </div>
          {isAdmin && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Project
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500 text-[20px]">
            error
          </span>
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200/50 shadow-sm">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1" />
                <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ProjectTable
          projects={filteredProjects}
          userMap={userMap}
          taskCountMap={taskCountMap}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          onViewDetails={handleViewDetails}
          onManageTasks={isAdmin ? handleManageTasks : undefined}
          isAdmin={isAdmin}
        />
      )}

      {isAdmin && (
        <>
          <ProjectFormModal
            isOpen={isFormOpen}
            onClose={() => { setIsFormOpen(false); setSelectedProject(null) }}
            onSubmit={handleFormSubmit}
            project={selectedProject}
          />

          <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => { setIsDeleteOpen(false); setProjectToDelete(null) }}
            onConfirm={handleConfirmDelete}
            itemName={projectToDelete?.title}
          />
        </>
      )}
    </div>
  )
}

export default ProjectsPage
