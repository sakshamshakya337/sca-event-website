import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdSearch, MdFilterList, MdDownload, MdChevronLeft, MdChevronRight, MdCheckCircle, MdCancel, MdPhotoCamera, MdArrowForward, MdVisibility, MdPeople, MdPendingActions, MdInfo } from 'react-icons/md'
import useAdminVerifyStore from '../../store/adminVerifyStore'

export default function VerifyUsers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { verifications, fetchVerifications, loading } = useAdminVerifyStore()

  useEffect(() => {
    fetchVerifications()
  }, [fetchVerifications])

  const filteredVerifications = verifications.filter(v => {
    const user = v.user || {}
    const firstName = user.firstName || ''
    const lastName = user.lastName || ''
    const universityId = v.referenceNumber || ''
    const matchesSearch = 
      firstName.toLowerCase().includes(search.toLowerCase()) || 
      lastName.toLowerCase().includes(search.toLowerCase()) || 
      universityId.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === '' || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-surface-container border border-outline-variant px-4 py-3 rounded-xl shadow-sm min-w-[140px]">
            <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center">
              <MdPeople className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-body-sm text-on-surface-variant">Total Requests</p>
              <p className="text-headline-md font-bold text-primary">{verifications.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border-2 border-amber-200 px-4 py-3 rounded-xl shadow-sm min-w-[140px]">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <MdPendingActions className="text-amber-700" size={20} />
            </div>
            <div>
              <p className="text-body-sm text-amber-700 font-medium">Pending</p>
              <p className="text-headline-md font-bold text-amber-700">{verifications.filter(v => v.status === 'pending').length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-outline-variant px-4 py-3 rounded-xl shadow-sm min-w-[140px]">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <MdCheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-body-sm text-on-surface-variant">Approved</p>
              <p className="text-headline-md font-bold text-green-600">{verifications.filter(v => v.status === 'approved').length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-outline-variant px-4 py-3 rounded-xl shadow-sm min-w-[140px]">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <MdCancel className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-body-sm text-on-surface-variant">Rejected</p>
              <p className="text-headline-md font-bold text-red-600">{verifications.filter(v => v.status === 'rejected').length}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                placeholder="Search by name or ID..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 font-body-md text-primary font-medium focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">User Information</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Identifier</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredVerifications.map((v) => {
                  const user = v.user || {}
                  return (
                    <tr key={v._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            v.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            v.status === 'approved' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {user.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-body-md font-bold text-primary">{user.firstName} {user.lastName}</p>
                            <p className="font-body-sm text-on-surface-variant">{v.referenceNumber}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-code-sm text-code-sm px-2 py-1 bg-surface-container rounded-md border border-outline-variant">
                          {user.registrationNumber || user.employeeId || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-body-sm text-on-surface-variant capitalize">{user.role || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          v.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          v.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {v.status === 'pending' ? (
                          <Link
                            to={`/admin/verify/${v._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-secondary text-white font-body-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                          >
                            Review <MdArrowForward size={16} />
                          </Link>
                        ) : (
                          <Link
                            to={`/admin/verify/${v._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-on-surface-variant font-body-sm font-semibold border border-outline-variant rounded-lg hover:bg-surface-container transition-all"
                          >
                            View <MdVisibility size={16} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
