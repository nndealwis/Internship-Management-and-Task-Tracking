import Modal from '../common/Modal'

function DeleteDialog({ isOpen, onClose, onConfirm, userName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User">
      <p className="text-sm text-gray-600 mb-6">
        Are you sure you want to delete <span className="font-semibold text-gray-900">{userName}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </Modal>
  )
}

export default DeleteDialog
