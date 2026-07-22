import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import api from '../config/axios'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Download, Users, Search, RefreshCw,
  ToggleLeft, ToggleRight, Loader2, CheckCircle2, XCircle,
} from 'lucide-react'

// ── Pure-JS CSV/Excel export (no external library needed) ───────────────────
function exportToCSV(rows, filename) {
  if (!rows.length) return

  const headers = [
    'S.No', 'Registration No.', 'Name', 'Email',
    'Course', 'Section', 'School', 'Phone', 'WhatsApp', 'Registered At',
  ]

  const escape = (v) => {
    const s = String(v ?? '').replace(/"/g, '""')
    return /[",\n\r]/.test(s) ? `"${s}"` : s
  }

  const csvRows = [
    headers.join(','),
    ...rows.map((r, i) => [
      i + 1,
      escape(r.registrationNumber),
      escape(r.name),
      escape(r.email),
      escape(r.course),
      escape(r.section),
      escape(r.school),
      escape(r.phone),
      escape(r.whatsapp),
      escape(new Date(r.createdAt).toLocaleString()),
    ].join(',')),
  ]

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main component ───────────────────────────────────────────────────────────
export default function EventRegistrations() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuthStore()

  const [event, setEvent]             = useState(null)
  const [registrations, setRegs]      = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [search, setSearch]           = useState('')
  const [toggling, setToggling]       = useState(false)

  const base = ['admin', 'superadmin'].includes(user?.role) ? '/admin' : '/faculty'

  // ── Load event + registrations ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [evRes, regRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/events/${id}/registrations`),
        ])
        setEvent(evRes.data.data)
        setRegs(regRes.data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load registrations.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── Toggle registration open/closed ────────────────────────────────────
  const handleToggle = async () => {
    if (!event) return
    setToggling(true)
    try {
      const next = !event.registrationOpen
      await api.patch(`/events/${id}/registration-toggle`, { open: next })
      setEvent(e => ({ ...e, registrationOpen: next }))
      toast.success(next ? 'Registrations opened.' : 'Registrations closed.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle registrations.')
    } finally {
      setToggling(false)
    }
  }

  // ── Filtered rows ───────────────────────────────────────────────────────
  const filtered = registrations.filter(r => {
    const q = search.toLowerCase()
    return (
      String(r.registrationNumber || '').toLowerCase().includes(q) ||
      String(r.name || '').toLowerCase().includes(q) ||
      String(r.email || '').toLowerCase().includes(q) ||
      String(r.course || '').toLowerCase().includes(q) ||
      String(r.section || '').toLowerCase().includes(q)
    )
  })

  // ── Download ────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!filtered.length) { toast.error('No data to download.'); return }
    const fname = `registrations-${(event?.title || id).replace(/\s+/g, '-').toLowerCase()}.csv`
    exportToCSV(filtered, fname)
    toast.success(`Downloaded ${filtered.length} records.`)
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <PageWrapper>
      <div className="max-w-[1200px] mx-auto space-y-5">

        {/* Back */}
        <Link
          to={`${base}/events`}
          className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft size={16} /> Back to Events
        </Link>

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary leading-tight">
              Student Registrations
            </h1>
            {event && (
              <p className="text-sm text-on-surface-variant mt-0.5">
                {event.title} &bull; {event.venue} &bull; {new Date(event.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Toggle registration */}
            {event && (
              <button
                onClick={handleToggle}
                disabled={toggling}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all disabled:opacity-60 ${
                  event.registrationOpen
                    ? 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-outline-variant bg-surface-container text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {toggling
                  ? <Loader2 size={14} className="animate-spin" />
                  : event.registrationOpen
                    ? <ToggleRight size={18} />
                    : <ToggleLeft size={18} />
                }
                {event.registrationOpen ? 'Registration Open' : 'Registration Closed'}
              </button>
            )}

            {/* Download */}
            <button
              onClick={handleDownload}
              disabled={loading || !filtered.length}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md"
            >
              <Download size={15} />
              Download CSV
            </button>
          </div>
        </div>

        {/* Stats strip */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm">
              <Users size={15} className="text-primary" />
              <span className="font-bold text-primary">{registrations.length}</span>
              <span className="text-on-surface-variant">total registered</span>
            </div>
            {search && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm">
                <Search size={15} className="text-secondary" />
                <span className="font-bold text-secondary">{filtered.length}</span>
                <span className="text-on-surface-variant">matching search</span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border-2 ${
              event?.registrationOpen
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-surface border-outline-variant text-on-surface-variant'
            }`}>
              {event?.registrationOpen
                ? <CheckCircle2 size={15} />
                : <XCircle size={15} />
              }
              {event?.registrationOpen ? 'Registrations open' : 'Registrations closed'}
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="Search by name, reg. no, email, course…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-on-surface-variant">
              <Loader2 size={22} className="animate-spin text-primary" />
              <span className="text-sm">Loading registrations…</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-sm text-error font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-sm text-primary hover:underline inline-flex items-center gap-1">
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Users size={40} className="mx-auto text-outline-variant mb-3" />
              <p className="text-sm font-semibold text-on-surface">
                {search ? 'No results match your search.' : 'No registrations yet for this event.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-xs text-primary hover:underline">
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline-variant">
                  <tr>
                    {['#','Reg. No.','Name','Email','Course','Section','Phone','WhatsApp','Registered At'].map(h => (
                      <th
                        key={h}
                        className="px-4 py-3 text-[10px] sm:text-[11px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filtered.map((r, i) => (
                    <tr key={r._id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-surface-container px-2 py-1 rounded border border-outline-variant text-primary font-semibold">
                          {r.registrationNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-on-surface whitespace-nowrap">{r.name}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{r.email}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{r.course}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{r.section}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{r.phone}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">{r.whatsapp}</td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        <span className="ml-1 text-on-surface-variant/60">
                          {new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!loading && !error && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-low flex items-center justify-between text-xs text-on-surface-variant">
              <span>Showing <strong>{filtered.length}</strong> of <strong>{registrations.length}</strong> registrations</span>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
              >
                <Download size={12} /> Download as CSV
              </button>
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  )
}
