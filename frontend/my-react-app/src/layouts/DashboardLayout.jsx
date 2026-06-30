import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ProfileDropdown from '../components/ProfileDropdown'

function DashboardLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="md:ml-64 ml-0">
        <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-950/80 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3 flex justify-end">
          <ProfileDropdown />
        </div>
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
