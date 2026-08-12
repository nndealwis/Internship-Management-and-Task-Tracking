import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

const TOAST_DURATION = 3000

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const styles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: 'check_circle',
      iconColor: 'text-green-500',
      text: 'text-green-700',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: 'error',
      iconColor: 'text-red-500',
      text: 'text-red-700',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'info',
      iconColor: 'text-blue-500',
      text: 'text-blue-700',
    },
  }

  const s = styles[toast.type] || styles.success

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all duration-200 ${
        s.bg
      } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <span className={`material-symbols-outlined text-[20px] ${s.iconColor}`}>
        {s.icon}
      </span>
      <p className={`text-sm font-medium ${s.text} flex-1`}>{toast.message}</p>
      <button
        onClick={handleClose}
        className={`p-0.5 rounded-lg hover:bg-black/5 transition-colors ${s.text}`}
      >
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  )
}

function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export { ToastProvider, useToast }
