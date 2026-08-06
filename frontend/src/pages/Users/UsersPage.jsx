import { useState, useEffect, useMemo } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService'
import UserTable from '../../components/users/UserTable'
import UserFormModal from '../../components/users/UserFormModal'
import DeleteDialog from '../../components/users/DeleteDialog'

function UsersPage() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUsers()
      setUsers(response.data)
    } catch (err) {
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase()
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    )
  }, [users, search])

  const handleCreate = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = (user) => {
    setUserToDelete(user)
    setIsDeleteOpen(true)
  }

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData)
      } else {
        await createUser(formData)
      }
      setIsFormOpen(false)
      setSelectedUser(null)
      await fetchUsers()
    } catch (err) {
      setError('Operation failed. Please try again.')
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(userToDelete.id)
      setIsDeleteOpen(false)
      setUserToDelete(null)
      await fetchUsers()
    } catch (err) {
      setError('Failed to delete user. Please try again.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500">Manage internship users</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
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
          Loading users...
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedUser(null) }}
        onSubmit={handleFormSubmit}
        user={selectedUser}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setUserToDelete(null) }}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.name}
      />
    </div>
  )
}

export default UsersPage
