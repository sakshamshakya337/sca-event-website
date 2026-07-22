import React from 'react'
import DashboardMessagesPanel from '../../components/dashboard/DashboardMessagesPanel'

export default function SuperadminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Superadmin Dashboard</h1>
          <p className="text-slate-600">Welcome to your dashboard! More features coming soon.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Main superadmin content can go here later */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <p className="text-slate-500">Main content area</p>
          </div>
        </div>
        <div className="lg:col-span-1 h-full">
          <DashboardMessagesPanel />
        </div>
      </div>
    </div>
  )
}
