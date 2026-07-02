import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon, Clock, MapPin, Star, HelpCircle,
  Link2Off, UserCheck, Image, Trash2, Plus, Users, ExternalLink,
} from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

// ── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, colorOn = 'bg-secondary' }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className={`w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all ${colorOn === 'bg-secondary' ? 'peer-checked:bg-secondary' : colorOn === 'bg-error' ? 'peer-checked:bg-error' : 'peer-checked:bg-green-600'}`} />
    </label>
  )
}

export default function EditEvent() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuthStore()
  const galleryInputRef = useRef(null)

  const [loading, setLoading]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [eventData, setEventData]       = useState(null)
  const [imageFile, setImageFile]       = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [galleryFiles, setGalleryFiles] = useState([])     // new files to upload
  const [removeIds, setRemoveIds]       = useState([])      // publicIds to delete
  const [regToggling, setRegToggling]   = useState(false)
  const [externalImageUrls, setExternalImageUrls] = useState(['', '', '', '', '', '', '', '', '', '']) // 10 empty inputs

  const inp = 'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res   = await api.get(`/events/${id}`)
        const event = res.data.data
        let formattedDate = ''
        try {
          const d = new Date(event.date)
          if (!isNaN(d.getTime())) formattedDate = d.toISOString().split('T')[0]
        } catch { formattedDate = event.date || '' }

        setEventData({
          title:                    event.title || '',
          type:                     event.type  || 'Workshop',
          expectedAudience:         event.expectedAudience || '',
          date:                     formattedDate,
          time:                     event.time  || '',
          venue:                    event.venue || '',
          description:              event.description || '',
          registerLink:             event.registerLink || '',
          isImportant:              Boolean(event.isImportant),
          registrationNotRequired:  Boolean(event.registrationNotRequired),
          registrationOpen:         Boolean(event.registrationOpen),
          gallery:                  event.gallery || [],
          externalImageUrls:        event.externalImageUrls || [],
          status:                   event.status,
        })

        // Initialize external image URLs: fill with saved URLs and pad to 10 with empty strings
        const savedUrls = event.externalImageUrls || []
        const urls = [...savedUrls]
        while (urls.length < 10) urls.push('')
        setExternalImageUrls(urls)

        if (event.imageUrl) setImagePreview(event.imageUrl)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load event')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  // ── Toggle registrationOpen via dedicated endpoint (instant) ─────────────
  const handleRegToggle = async (val) => {
    setRegToggling(true)
    try {
      await api.patch(`/events/${id}/registration-toggle`, { open: val })
      setEventData(d => ({ ...d, registrationOpen: val }))
      toast.success(val ? 'Registrations opened.' : 'Registrations closed.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle registrations.')
    } finally {
      setRegToggling(false)
    }
  }

  // ── Mark a gallery image for removal ────────────────────────────────────
  const markRemove = (publicId) => {
    setRemoveIds(r => r.includes(publicId) ? r.filter(x => x !== publicId) : [...r, publicId])
  }

  // ── Add new gallery files (cap 6 total) ──────────────────────────────────
  const handleGalleryAdd = (e) => {
    const existing = (eventData?.gallery?.length ?? 0) - removeIds.length + galleryFiles.length
    const slots    = 6 - existing
    if (slots <= 0) { toast.error('Maximum 6 gallery images allowed.'); return }
    const files    = Array.from(e.target.files).slice(0, slots)
    setGalleryFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeNewGalleryFile = (idx) =>
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx))

  // ── Save changes ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventData) return
    setSaving(true)
    try {
      const payload = new FormData()
      payload.append('title',                   eventData.title)
      payload.append('type',                    eventData.type)
      payload.append('date',                    eventData.date)
      if (eventData.time)            payload.append('time',            eventData.time)
      payload.append('venue',                   eventData.venue)
      if (eventData.expectedAudience !== '')
        payload.append('expectedAudience',       eventData.expectedAudience)
      payload.append('description',             eventData.description)
      payload.append('registerLink',            eventData.registerLink)
      payload.append('isImportant',             eventData.isImportant             ? 'true' : 'false')
      payload.append('registrationNotRequired', eventData.registrationNotRequired ? 'true' : 'false')
      payload.append('registrationOpen',        eventData.registrationOpen        ? 'true' : 'false')
      if (imageFile) payload.append('image', imageFile)
      galleryFiles.forEach(f => payload.append('gallery', f))
      if (removeIds.length > 0)
        payload.append('removeGalleryIds', JSON.stringify(removeIds))
      // Add external image URLs
      const validUrls = externalImageUrls.filter(url => url.trim().length > 0)
      console.log('EditEvent validUrls:', validUrls)
      payload.append('externalImageUrls', JSON.stringify(validUrls))

      await api.put(`/events/${id}`, payload)
      toast.success('Event updated successfully')
      const base = ['admin', 'superadmin'].includes(user?.role) ? '/admin' : '/faculty'
      navigate(`${base}/events/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !eventData) {
    return (
      <PageWrapper>
        <div className="max-w-[800px] mx-auto py-16 text-center text-on-surface-variant">
          Loading event details…
        </div>
      </PageWrapper>
    )
  }

  const isApproved     = eventData.status === 'approved'
  const canViewRegs    = ['admin', 'superadmin', 'faculty'].includes(user?.role)
  const base           = ['admin', 'superadmin'].includes(user?.role) ? '/admin' : '/faculty'
  const existingGallery = (eventData.gallery || []).filter(g => !removeIds.includes(g.publicId))
  const totalGallery    = existingGallery.length + galleryFiles.length

  return (
    <PageWrapper>
      <div className="max-w-[800px] mx-auto space-y-6">

        {/* ── Registration control panel (approved events only) ─────────── */}
        {isApproved && (
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-outline-variant bg-primary/5">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Registration Control</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                This event is <span className="font-semibold text-green-700">approved</span> and visible to the public.
                Use these controls to manage registrations without re-saving the form.
              </p>
            </div>
            <div className="p-5 space-y-4">

              {/* Open / close registrations */}
              <div className="flex items-center justify-between gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant">
                <div>
                  <p className="text-sm font-semibold text-on-surface">
                    {eventData.registrationOpen ? '🟢 Registrations are OPEN' : '🔴 Registrations are CLOSED'}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {eventData.registrationOpen
                      ? 'The "Register Now" button is visible on the public event page.'
                      : 'Turn on to show the "Register Now" button on the public event page.'}
                  </p>
                </div>
                <div className="shrink-0">
                  {regToggling ? (
                    <div className="w-11 h-6 bg-surface-container rounded-full animate-pulse" />
                  ) : (
                    <Toggle
                      checked={eventData.registrationOpen}
                      onChange={e => handleRegToggle(e.target.checked)}
                      colorOn="bg-green-600"
                    />
                  )}
                </div>
              </div>

              {/* View registrations link */}
              {canViewRegs && (
                <Link
                  to={`${base}/events/${id}/registrations`}
                  className="flex items-center justify-between gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-primary">View Student Registrations</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">See all registered students and download as Excel</p>
                    </div>
                  </div>
                  <ExternalLink size={15} className="text-primary shrink-0" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Main edit form ───────────────────────────────────────────────── */}
        <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-outline-variant bg-surface-container-low">
            <h1 className="text-lg font-bold text-primary">Edit Event</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              Update event details, images, and registration settings.
              {!isApproved && <span className="text-amber-700"> Note: editing a non-pending event may reset approval status.</span>}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Event Title *</label>
              <input type="text" className={inp} value={eventData.title} required
                onChange={e => setEventData(d => ({ ...d, title: e.target.value }))} />
            </div>

            {/* Type + Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Event Type *</label>
                <select className={inp} value={eventData.type}
                  onChange={e => setEventData(d => ({ ...d, type: e.target.value }))}>
                  {['Workshop','Seminar','Cultural','Sports','Technical','Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Expected Audience</label>
                <input type="number" className={inp} value={eventData.expectedAudience}
                  onChange={e => setEventData(d => ({ ...d, expectedAudience: e.target.value }))} />
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Event Date *</label>
                <input type="date" className={inp} value={eventData.date} required
                  onChange={e => setEventData(d => ({ ...d, date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-on-surface">Event Time</label>
                <input type="time" className={inp} value={eventData.time}
                  onChange={e => setEventData(d => ({ ...d, time: e.target.value }))} />
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Venue *</label>
              <input type="text" className={inp} value={eventData.venue} required
                onChange={e => setEventData(d => ({ ...d, venue: e.target.value }))} />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">Description</label>
              <textarea rows={5} className={inp} value={eventData.description}
                onChange={e => setEventData(d => ({ ...d, description: e.target.value }))} />
            </div>

            {/* Register link */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">External Registration Link</label>
              <input type="url" className={inp} placeholder="https://example.com/register" value={eventData.registerLink}
                onChange={e => setEventData(d => ({ ...d, registerLink: e.target.value }))} />
            </div>

            {/* Banner image */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Banner Image</label>
              <p className="text-xs text-on-surface-variant">Recommended: 1200×630 px (16:9). Replaces the existing banner.</p>
              <input type="file" accept="image/*" className="text-sm"
                onChange={e => {
                  const f = e.target.files?.[0]
                  setImageFile(f || null)
                  setImagePreview(f ? URL.createObjectURL(f) : eventData.gallery?.[0]?.url || null)
                }} />
              {imagePreview && (
                <div className="rounded-xl overflow-hidden border border-outline-variant mt-2">
                  <img src={imagePreview} alt="Banner preview" className="w-full max-h-52 object-cover" />
                </div>
              )}
            </div>

            {/* Gallery management */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-on-surface">Gallery Images</label>
                  <p className="text-xs text-on-surface-variant mt-0.5">Up to 6 images. Click an existing image to mark it for removal.</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${totalGallery >= 6 ? 'bg-red-100 text-red-700' : 'bg-surface-container text-on-surface-variant'}`}>
                  {totalGallery}/6
                </span>
              </div>

              {/* Existing gallery */}
              {existingGallery.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(eventData.gallery || []).map((img, i) => {
                    const markedRemove = removeIds.includes(img.publicId)
                    return (
                      <div key={i} className="relative group">
                        <button
                          type="button"
                          onClick={() => markRemove(img.publicId)}
                          className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            markedRemove ? 'border-error opacity-40' : 'border-outline-variant hover:border-error'
                          }`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                            markedRemove ? 'bg-red-500/30 opacity-100' : 'opacity-0 group-hover:opacity-100 bg-red-500/20'
                          }`}>
                            <Trash2 size={16} className="text-error" />
                          </div>
                        </button>
                        {markedRemove && (
                          <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Remove
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* New gallery files preview */}
              {galleryFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {galleryFiles.map((f, i) => (
                    <div key={i} className="relative group">
                      <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/40">
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewGalleryFile(i)}
                        className="absolute -top-1.5 -right-1.5 bg-error text-white rounded-full p-0.5 hover:bg-error/80 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                      <span className="absolute bottom-0.5 left-0.5 bg-primary text-white text-[8px] font-bold px-1 rounded">NEW</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add gallery button */}
              {totalGallery < 6 && (
                <>
                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryAdd}
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-outline-variant rounded-xl text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={16} /> Add Gallery Images ({6 - totalGallery} slots left)
                  </button>
                </>
              )}
            </div>

            {/* External Image URLs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-semibold text-on-surface">Image URLs</label>
                  <p className="text-xs text-on-surface-variant mt-0.5">Up to 10 image URLs (Cloudinary, ImageBB, etc.) shown in carousel.</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                  externalImageUrls.filter(url => url.trim().length > 0).length >= 10 ? 'bg-red-100 text-red-700' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {externalImageUrls.filter(url => url.trim().length > 0).length}/10
                </span>
              </div>

              <div className="space-y-2">
                {externalImageUrls.map((url, i) => (
                  <input
                    key={i}
                    type="url"
                    placeholder={`Image URL ${i + 1}`}
                    className={inp}
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...externalImageUrls]
                      newUrls[i] = e.target.value
                      setExternalImageUrls(newUrls)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              {/* Important */}
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                    <Star size={18} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">Mark as Important</p>
                    <p className="text-xs text-on-surface-variant">Flag for priority display</p>
                  </div>
                </div>
                <Toggle checked={eventData.isImportant}
                  onChange={e => setEventData(d => ({ ...d, isImportant: e.target.checked }))} />
              </div>

              {/* Registration not required */}
              <div className="flex items-center justify-between p-4 bg-error/5 rounded-xl border border-error/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-error/20 flex items-center justify-center text-error shrink-0">
                    <Link2Off size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">Registration Not Required</p>
                    <p className="text-xs text-on-surface-variant">Hide all registration options from the public page</p>
                  </div>
                </div>
                <Toggle checked={eventData.registrationNotRequired}
                  onChange={e => setEventData(d => ({ ...d, registrationNotRequired: e.target.checked }))}
                  colorOn="bg-error" />
              </div>

              {/* Registration open (only in form — instant toggle is above for approved events) */}
              {!isApproved && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">Open Registrations</p>
                      <p className="text-xs text-on-surface-variant">Show "Register Now" button on public event page</p>
                    </div>
                  </div>
                  <Toggle checked={eventData.registrationOpen}
                    onChange={e => setEventData(d => ({ ...d, registrationOpen: e.target.checked }))}
                    colorOn="bg-green-600" />
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto rounded-xl border border-outline-variant px-6 py-3 text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto rounded-xl bg-primary px-8 py-3 text-sm text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex items-start gap-3">
            <HelpCircle size={18} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {isApproved
                ? 'This event is live. Saving will NOT reset approval status for admins. Faculty edits will move it back to pending for re-review.'
                : 'Saving changes to an approved event (as faculty) will reset it to pending and require re-approval before it shows publicly.'}
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
