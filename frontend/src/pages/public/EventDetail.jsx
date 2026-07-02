import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../config/axios'
import PublicLayout from '../../components/layout/PublicLayout'
import {
  Calendar, Clock, MapPin, Users, Tag, ChevronLeft,
  ChevronRight, X, CheckCircle2, Loader2, AlertCircle,
} from 'lucide-react'
import { formatDate } from '../../lib/utils'

// ── Gallery carousel ──────────────────────────────────────────────────────────
function Gallery({ images }) {
  const [idx, setIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (!images?.length) return null

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length)
  const next = () => setIdx(i => (i + 1) % images.length)

  return (
    <>
      {/* Carousel */}
      <div className="relative rounded-2xl overflow-hidden bg-black group">
        <img
          src={images[idx].url}
          alt={`Gallery ${idx + 1}`}
          className="w-full max-h-[480px] object-cover cursor-zoom-in"
          onClick={() => setLightbox(true)}
        />

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors">
              <ChevronRight size={20} />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Counter */}
        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {idx + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(false)}>
            <X size={28} />
          </button>
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          <img
            src={images[idx].url}
            alt=""
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-4 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors">
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </>
  )
}

// ── Registration form modal ──────────────────────────────────────────────────
function RegistrationModal({ event, onClose }) {
  const [form, setForm] = useState({
    registrationNumber: '',
    name:    '',
    email:   '',
    course:  '',
    section: '',
    school:  'School of Computer Applications',
    phone:   '',
    whatsapp:'',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const inp = 'w-full px-4 py-2.5 bg-[#f0f4f8] border border-[#c4c6cf] rounded-lg text-sm focus:ring-2 focus:ring-primary/25 focus:border-primary outline-none transition-all'
  const lbl = 'text-xs font-semibold text-[#474e58] uppercase tracking-wider mb-1 block'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await api.post(`/events/detail/${event._id}/register`, form)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-8 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-[#022448]">Register for Event</h2>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
            <X size={20} />
          </button>
        </div>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#022448]">Registered!</h3>
              <p className="text-sm text-gray-500 mt-1">
                You've successfully registered for <strong>{event.title}</strong>.
              </p>
            </div>
            <button onClick={onClose} className="mt-2 px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
              Done
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 sm:px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Registration Number *</label>
                <input className={inp} placeholder="e.g. 12506789" value={form.registrationNumber}
                  onChange={e => update('registrationNumber', e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Full Name *</label>
                <input className={inp} placeholder="Your full name" value={form.name}
                  onChange={e => update('name', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className={lbl}>Email Address *</label>
              <input className={inp} type="email" placeholder="your@email.com" value={form.email}
                onChange={e => update('email', e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Course / Program *</label>
                <input className={inp} placeholder="e.g. B.Tech CSE" value={form.course}
                  onChange={e => update('course', e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>Section *</label>
                <input className={inp} placeholder="e.g. K23" value={form.section}
                  onChange={e => update('section', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className={lbl}>School</label>
              <input className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed`}
                value="School of Computer Applications" readOnly />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Phone Number *</label>
                <input className={inp} type="tel" placeholder="10-digit mobile" value={form.phone}
                  onChange={e => update('phone', e.target.value)} required />
              </div>
              <div>
                <label className={lbl}>WhatsApp Number *</label>
                <input className={inp} type="tel" placeholder="WhatsApp number" value={form.whatsapp}
                  onChange={e => update('whatsapp', e.target.value)} required />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 border-l-4 border-l-red-500 text-red-700 px-3 py-2.5 rounded-lg text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="pt-2 pb-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm shadow-md"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Registering…</> : 'Register Now'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">
                One registration per student per event.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PublicEventDetail() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [showReg, setShowReg] = useState(false)
  const [count, setCount]     = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, cntRes] = await Promise.all([
          api.get(`/events/detail/${id}`),
          api.get(`/events/detail/${id}/registrations/count`).catch(() => null),
        ])
        setEvent(evRes.data.data)
        if (cntRes) setCount(cntRes.data.data.count)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load event details')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const allImages = event ? [
    ...(event.imageUrl ? [{ url: event.imageUrl, publicId: 'banner' }] : []),
    ...(event.gallery  ?? []),
  ] : []

  const showRegButton = event &&
    !event.registrationNotRequired &&
    event.registrationOpen

  return (
    <PublicLayout>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center space-y-3">
            <p className="text-lg font-semibold text-on-surface">{error}</p>
            <Link to="/events" className="text-sm text-primary hover:underline">← Back to Events</Link>
          </div>
        </div>
      ) : (
        <div className="py-10 sm:py-14">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

            {/* Back link */}
            <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6">
              <ChevronLeft size={16} /> Back to Events
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── Left column — main content ─────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Gallery */}
                {allImages.length > 0 && <Gallery images={allImages} />}

                {/* Title + type */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
                      <Tag size={11} /> {event.type}
                    </span>
                    {event.isImportant && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface leading-tight">
                    {event.title}
                  </h1>
                </div>

                {/* Description / blog */}
                {event.description && (
                  <div className="prose prose-sm sm:prose max-w-none text-on-surface-variant leading-relaxed">
                    {event.description.split('\n').filter(Boolean).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}

              </div>

              {/* ── Right column — sidebar ─────────────────────────────── */}
              <div className="space-y-5">

                {/* Event details card */}
                <div className="bg-surface-card border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
                  <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest">Event Details</h2>

                  {[
                    { icon: Calendar, label: 'Date',  value: formatDate(event.date) },
                    { icon: Clock,    label: 'Time',  value: event.time || 'TBA' },
                    { icon: MapPin,   label: 'Venue', value: event.venue },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-semibold text-on-surface mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}

                  {count !== null && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                        <Users size={15} className="text-green-700" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Registered</p>
                        <p className="text-sm font-semibold text-on-surface mt-0.5">{count} student{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Registration CTA */}
                {showRegButton && (
                  <button
                    onClick={() => setShowReg(true)}
                    className="w-full py-3.5 bg-primary text-on-primary font-bold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
                  >
                    Register Now →
                  </button>
                )}

                {event.registrationNotRequired && (
                  <div className="text-center py-2 text-sm text-on-surface-variant bg-surface-container rounded-xl border border-outline-variant px-4">
                    No registration required for this event.
                  </div>
                )}

                {!event.registrationNotRequired && !event.registrationOpen && (
                  <div className="text-center py-2 text-sm text-amber-700 bg-amber-50 rounded-xl border border-amber-200 px-4">
                    Registrations are not open yet.
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}

      {showReg && event && (
        <RegistrationModal event={event} onClose={() => setShowReg(false)} />
      )}
    </PublicLayout>
  )
}
