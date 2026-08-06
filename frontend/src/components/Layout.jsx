import { Outlet } from 'react-router-dom'
import Navbar from './common/Navbar'
import Sidebar from './common/Sidebar'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="ml-64 flex-1 p-6 overflow-auto h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
