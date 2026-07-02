import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { Search, CheckCircle2, XCircle, ArrowRight, Eye, Users, ClipboardList, Trash2, AlertTriangle } from 'lucide-react'
import useAdminVerifyStore from '../../store/adminVerifyStore'
import useAdminUserStore from '../../store/adminUserStore'
import toast from 'react-hot-toast'

export default function VerifyUsers() {
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [deletingId, setDeletingId]         = useState(null)

  const { verifications, fetchVerifications, loading } = useAdminVerifyStore()
  const { deleteUser } = useAdminUserStore()

  useEffect(() => { fetchVerifications() }, [fetchVerifications])

  const filtered = verifications.filter(v => {
    const u    = v.user || {}
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase()
    const uid  = (v.referenceNumber || '').toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || uid.includes(search.toLowerCase())
    const matchStatus = !statusFilter || v.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleDelete = async (v) => {
    const userId = v.user?._id
    if (!userId) { toast.error('Cannot delete — user ID not found.'); return }
    setDeletingId(v._id)
    try {
      await deleteUser(userId)
      await fetchVerifications()
      toast.success(`${v.user?.firstName} ${v.user?.lastName}'s account deleted.`)
    } catch (err) {
      toast.error(err.message || 'Failed to delete user.')
    } finally {
      setDeletingId(null)
      setDeleteConfirmId(null)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto space-y-5 sm:space-y-6">

        {/* ── Stat chips ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',    value: verifications.length,                                        icon: Users,        cls: 'text-primary',    border: 'border-outline-variant', bg: 'bg-surface-container' },
            { label: 'Pending',  value: verifications.filter(v => v.status === 'pending').length,   icon: ClipboardList, cls: 'text-amber-700', border: 'border-amber-200',      bg: 'bg-white' },
            { label: 'Approved', value: verifications.filter(v => v.status === 'approved').length,  icon: CheckCircle2,  cls: 'text-green-600', border: 'border-outline-variant', bg: 'bg-white' },
            { label: 'Rejected', value: verifications.filter(v => v.status === 'rejected').length,  icon: XCircle,       cls: 'text-red-600',   border: 'border-outline-variant', bg: 'bg-white' },
          ].map(({ label, value, icon: Icon, cls, border, bg }) => (
            <div key={label} className={`flex items-center gap-3 ${bg} border-2 ${border} px-4 py-3 rounded-xl shadow-sm min-w-[120px]`}>
              <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0">
                <Icon className={cls} size={18} />
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-medium">{label}</p>
                <p className={`text-xl font-bold ${cls}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Search + filter ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 sm:p-4 rounded-xl border border-outline-variant">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              className="w-full pl-9 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:outline-none"
              placeholder="Search by name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-primary font-medium focus:outline-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* ── Table ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-outline-variant">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                  <th className="px-4 sm:px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden sm:table-cell">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider hidden md:table-cell">Role</th>
                  <th className="px-4 sm:px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-on-surface-variant">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-on-surface-variant">No results found.</td></tr>
                ) : filtered.map(v => {
                  const u            = v.user || {}
                  const isConfirming = deleteConfirmId === v._id
                  const isDeleting   = deletingId === v._id

                  return (
                    <React.Fragment key={v._id}>

                      {/* ── Main row ─────────────────────────────────── */}
                      <tr className="hover:bg-surface-container-low transition-colors">

                        {/* User */}
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              v.status === 'pending'  ? 'bg-amber-100 text-amber-700' :
                              v.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100   text-red-700'
                            }`}>
                              {u.firstName?.[0] || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-primary truncate">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-on-surface-variant">{v.referenceNumber}</p>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="px-4 sm:px-6 py-3.5 hidden sm:table-cell">
                          <span className="font-mono text-xs px-2 py-1 bg-surface-container rounded border border-outline-variant">
                            {u.registrationNumber || u.employeeId || '—'}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="px-4 sm:px-6 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-on-surface-variant capitalize">{u.role || '—'}</span>
                        </td>

                        {/* Status */}
                        <td className="px-4 sm:px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            v.status === 'pending'  ? 'bg-amber-100 text-amber-700 border-amber-200' :
                            v.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                                      'bg-red-100   text-red-700   border-red-200'
                          }`}>
                            {v.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 sm:px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {v.status === 'pending' ? (
                              <Link
                                to={`/admin/verify/${v._id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-secondary text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-all"
                              >
                                Review <ArrowRight size={13} />
                              </Link>
                            ) : (
                              <Link
                                to={`/admin/verify/${v._id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white text-on-surface-variant text-xs font-semibold border border-outline-variant rounded-lg hover:bg-surface-container transition-all"
                              >
                                View <Eye size={13} />
                              </Link>
                            )}

                            {/* Trash icon — toggles inline confirm */}
                            <button
                              onClick={() => setDeleteConfirmId(isConfirming ? null : v._id)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors disabled:opacity-40"
                              title="Delete user account"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Inline delete confirm row ─────────────────── */}
                      {isConfirming && (
                        <tr className="bg-red-50/60">
                          <td colSpan={5} className="px-4 sm:px-6 py-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-red-200 rounded-xl px-4 py-3 shadow-sm">
                              <div className="flex items-start gap-3">
                                <AlertTriangle size={17} className="text-error shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-bold text-error">Delete account permanently?</p>
                                  <p className="text-xs text-on-surface-variant mt-0.5">
                                    This will permanently delete{' '}
                                    <strong>{u.firstName} {u.lastName}</strong>'s account and all associated data.
                                    This action cannot be undone.
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleDelete(v)}
                                  disabled={isDeleting}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error text-white text-xs font-bold rounded-lg hover:bg-error/90 transition-colors disabled:opacity-60"
                                >
                                  <Trash2 size={12} />
                                  {isDeleting ? 'Deleting…' : 'Delete'}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  disabled={isDeleting}
                                  className="px-3 py-1.5 border border-outline-variant text-on-surface-variant text-xs font-bold rounded-lg hover:bg-surface-container transition-colors disabled:opacity-60"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                    </React.Fragment>
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
