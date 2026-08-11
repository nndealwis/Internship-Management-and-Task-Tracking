import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './common/Navbar'
import Sidebar from './common/Sidebar'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="lg:ml-[240px] pt-16 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout
