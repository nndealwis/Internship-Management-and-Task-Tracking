import { useState, useEffect, useMemo } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../../services/projectService'
import ProjectTable from '../../components/projects/ProjectTable'
import ProjectFormModal from '../../components/projects/ProjectFormModal'
import DeleteDialog from '../../components/common/DeleteDialog'

function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getProjects()
      setProjects(response.data)
    } catch (err) {
      setError('Failed to load projects. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedProject) {
        await updateProject(selectedProject.id, formData)
      } else {
        await createProject(formData)
      }
      setIsFormOpen(false)
      setSelectedProject(null)
      await fetchProjects()
    } catch (err) {
      setError('Operation failed. Please try again.')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteProject(projectToDelete.id)
      setIsDeleteOpen(false)
      setProjectToDelete(null)
      await fetchProjects()
    } catch (err) {
      setError('Failed to delete project. Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-sm text-gray-500">Manage internship projects</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title or technology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500">
          Loading projects...
        </div>
      ) : (
        <ProjectTable
          projects={filteredProjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

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
    </div>
  )
}

export default ProjectsPage
