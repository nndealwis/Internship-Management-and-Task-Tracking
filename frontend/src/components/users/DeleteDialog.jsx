import Modal from '../common/Modal'

function DeleteDialog({ isOpen, onClose, onConfirm, userName }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-50 rounded-lg flex-shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-red-500 text-[20px]">
              delete
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-gray-900">{userName}</span>?
            </p>
            <p className="text-sm text-gray-400 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteDialog
