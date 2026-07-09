import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import {
  Plus, Users, ChevronRight, Star, MapPin, Clock,
  Calendar as CalendarRange, Link2Off, UserCheck, Trash2,
} from 'lucide-react'
import api from '../../config/axios'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

// ── Reusable toggle ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, colorOn = 'peer-checked:bg-secondary' }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className={`w-11 h-6 bg-outline-variant rounded-full peer ${colorOn} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all`} />
    </label>
  )
}

export default function CreateEvent() {
  const navigate        = useNavigate()
  const { user }        = useAuthStore()
  const galleryInputRef = useRef(null)

  const inp = 'w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all'

  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop',
    expectedAudience: '',
    startDate: '',
    endDate: '',
    time: '',
    venue: '',
    description: '',
    registerLink: '',
    registrationNotRequired: false,
    registrationOpen: false,
    isImportant: false,
    assignedFaculty: [],
  })

  const [externalImageUrls, setExternalImageUrls] = useState(['', '', '', '', '', '', '', '', '', '']) // 10 empty inputs

  const [facultyList,    setFacultyList]    = useState([])
  const [loadingFaculty, setLoadingFaculty] = useState(false)
  const [imageFile,      setImageFile]      = useState(null)
  const [imagePreview,   setImagePreview]   = useState(null)
  const [galleryFiles,   setGalleryFiles]   = useState([])   // up to 6
  const [loading,        setLoading]        = useState(false)

  // Fetch faculty list for assignment
  useEffect(() => {
    const fetch_ = async () => {
      setLoadingFaculty(true)
      try {
        const res = await api.get('/users/faculty')
        setFacultyList(res.data.data || [])
      } catch { /* silently ignore */ }
      finally { setLoadingFaculty(false) }
    }
    fetch_()
  }, [])

  // ── Gallery helpers ──────────────────────────────────────────────────────
  const handleGalleryAdd = (e) => {
    const slots = 6 - galleryFiles.length
    if (slots <= 0) { toast.error('Maximum 6 gallery images allowed.'); return }
    const files = Array.from(e.target.files).slice(0, slots)
    setGalleryFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeGalleryFile = (idx) =>
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx))

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title',                   formData.title)
      payload.append('type',                    formData.type)
      payload.append('startDate',               formData.startDate)
      payload.append('endDate',                 formData.endDate)
      if (formData.time)            payload.append('time',            formData.time)
      payload.append('venue',                   formData.venue)
      if (formData.expectedAudience) payload.append('expectedAudience', formData.expectedAudience)
      if (formData.description)     payload.append('description',     formData.description)
      if (formData.registerLink)    payload.append('registerLink',    formData.registerLink)
      payload.append('isImportant',           formData.isImportant           ? 'true' : 'false')
      payload.append('registrationNotRequired', formData.registrationNotRequired ? 'true' : 'false')
      payload.append('registrationOpen',      formData.registrationOpen      ? 'true' : 'false')
      if (formData.assignedFaculty.length > 0)
        payload.append('assignedFaculty', JSON.stringify(formData.assignedFaculty))
      if (imageFile) payload.append('image', imageFile)
      galleryFiles.forEach(f => payload.append('gallery', f))
      // Add external image URLs
      const validUrls = externalImageUrls.filter(url => url.trim().length > 0)
      console.log('CreateEvent validUrls:', validUrls)
      payload.append('externalImageUrls', JSON.stringify(validUrls))

      await api.post('/events', payload)
      toast.success('Event created! Pending admin approval.')
      navigate(['admin', 'superadmin'].includes(user?.role) ? '/admin' : '/faculty')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setFormData(d => ({ ...d, [k]: v }))
  const toggleFaculty = (id, checked) =>
    set('assignedFaculty', checked
      ? [...formData.assignedFaculty, id]
      : formData.assignedFaculty.filter(x => x !== id))

  return (
    <PageWrapper>
      <div className="max-w-[760px] mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-outline-variant bg-surface-container-low">
            <h2 className="text-lg sm:text-xl font-bold text-primary">Create New Event</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Fill in the event details. It will go to admin for approval before appearing publicly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">Event Title *</label>
              <input className={inp} placeholder="Enter formal event name" type="text"
                value={formData.title} onChange={e => set('title', e.target.value)} required />
            </div>

            {/* Type + Audience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface block">Event Type *</label>
                <select className={inp} value={formData.type} onChange={e => set('type', e.target.value)} required>
                  {['Workshop','Seminar','Cultural','Sports','Technical','Other'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface block">Expected Audience</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input className={`${inp} pl-11`} type="number" placeholder="e.g. 100"
                    value={formData.expectedAudience} onChange={e => set('expectedAudience', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Dates & Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2"><CalendarRange size={16} className="text-secondary" /> Start Date *</label>
                <div className="relative">
                  <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input className={`${inp} pl-11`} type="date"
                    value={formData.startDate} onChange={e => set('startDate', e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface flex items-center gap-2"><CalendarRange size={16} className="text-secondary" /> End Date *</label>
                <div className="relative">
                  <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input className={`${inp} pl-11`} type="date"
                    value={formData.endDate} onChange={e => set('endDate', e.target.value)} required min={formData.startDate} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface block">Event Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input className={`${inp} pl-11`} type="time"
                    value={formData.time} onChange={e => set('time', e.target.value)} />
                </div>
              </div>
            </div>
            {/* Venue */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">Venue *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className={`${inp} pl-11`} placeholder="Enter precise location"
                  value={formData.venue} onChange={e => set('venue', e.target.value)} required />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">Description / Blog Content</label>
              <p className="text-xs text-on-surface-variant">This will appear on the public event detail page. Each new line becomes a paragraph.</p>
              <textarea
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none transition-all"
                rows={6}
                placeholder="Write a detailed description of the event…"
                value={formData.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            {/* Registration link */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">External Registration Link (optional)</label>
              <input className={inp} placeholder="https://example.com/register" type="url"
                value={formData.registerLink} onChange={e => set('registerLink', e.target.value)} />
            </div>

            {/* Banner image */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface block">Banner Image (optional)</label>
              <p className="text-xs text-on-surface-variant">Recommended: 1200×630 px (16:9 ratio). Shown on event cards and detail page.</p>
              <input
                type="file" accept="image/*"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-semibold hover:file:bg-primary/20"
                onChange={e => {
                  const f = e.target.files?.[0]
                  setImageFile(f || null)
                  setImagePreview(f ? URL.createObjectURL(f) : null)
                }}
              />
              {imagePreview && (
                <div className="rounded-xl overflow-hidden border border-outline-variant mt-2">
                  <img src={imagePreview} alt="Banner preview" className="w-full max-h-48 object-cover" />
                </div>
              )}
            </div>

            {/* Gallery images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-on-surface block">Gallery Images (optional)</label>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Up to 6 photos shown in a carousel on the event detail page.
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                  galleryFiles.length >= 6 ? 'bg-red-100 text-red-700' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {galleryFiles.length}/6
                </span>
              </div>

              {/* Gallery previews */}
              {galleryFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {galleryFiles.map((f, i) => (
                    <div key={i} className="relative group">
                      <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/30">
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeGalleryFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/80 transition-colors shadow"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add button */}
              {galleryFiles.length < 6 && (
                <>
                  <input
                    ref={galleryInputRef}
                    type="file" accept="image/*" multiple
                    className="hidden"
                    onChange={handleGalleryAdd}
                  />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-outline-variant rounded-xl text-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={16} /> Add Photos ({6 - galleryFiles.length} slots left)
                  </button>
                </>
              )}
            </div>

            {/* External Image URLs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-on-surface block">Image URLs (optional)</label>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Up to 10 image URLs (Cloudinary, ImageBB, etc.) shown in carousel.
                  </p>
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

            {/* ── Toggles ──────────────────────────────────────────────────── */}
            <div className="space-y-3">

              {/* Mark as Important */}
              <div className="flex items-center justify-between gap-4 p-4 bg-secondary/5 rounded-xl border border-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                    <Star size={18} fill="currentColor" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">Mark as Important</p>
                    <p className="text-xs text-on-surface-variant">Flag this event for priority display</p>
                  </div>
                </div>
                <Toggle checked={formData.isImportant} onChange={e => set('isImportant', e.target.checked)} />
              </div>

              {/* Registration Not Required */}
              <div className="flex items-center justify-between gap-4 p-4 bg-error/5 rounded-xl border border-error/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-error/20 flex items-center justify-center text-error shrink-0">
                    <Link2Off size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">Registration Not Required</p>
                    <p className="text-xs text-on-surface-variant">Hides all registration options from the public page</p>
                  </div>
                </div>
                <Toggle
                  checked={formData.registrationNotRequired}
                  onChange={e => set('registrationNotRequired', e.target.checked)}
                  colorOn="peer-checked:bg-error"
                />
              </div>

              {/* Open Registrations */}
              <div className="flex items-center justify-between gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">Open Registrations at Launch</p>
                    <p className="text-xs text-on-surface-variant">
                      If on, "Register Now" button shows once the event is approved.
                      You can also toggle this anytime from Edit Event.
                    </p>
                  </div>
                </div>
                <Toggle
                  checked={formData.registrationOpen}
                  onChange={e => set('registrationOpen', e.target.checked)}
                  colorOn="peer-checked:bg-green-600"
                />
              </div>
            </div>

            {/* Assign Faculty */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface block">Assign Co-Faculty (Optional)</label>
              <p className="text-xs text-on-surface-variant">Selected faculty can also manage and edit this event.</p>
              <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-lg divide-y divide-outline-variant">
                {loadingFaculty ? (
                  <p className="text-sm text-on-surface-variant p-4">Loading faculty…</p>
                ) : facultyList.length === 0 ? (
                  <p className="text-sm text-on-surface-variant p-4">No faculty found</p>
                ) : facultyList.map(f => (
                  <label key={f._id} className="flex items-center gap-3 p-3 hover:bg-surface-container-high cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-secondary rounded border-outline focus:ring-secondary"
                      checked={formData.assignedFaculty.includes(f._id)}
                      onChange={e => toggleFaculty(f._id, e.target.checked)}
                    />
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {f.firstName?.[0]}{f.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{f.firstName} {f.lastName}</p>
                      <p className="text-xs text-on-surface-variant">{f.employeeId || 'N/A'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => navigate(['admin','superadmin'].includes(user?.role) ? '/admin' : '/faculty')}
                className="w-full sm:w-auto px-8 h-11 border border-outline-variant text-on-surface-variant text-sm font-semibold rounded-lg hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 h-11 bg-primary text-white text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {loading ? 'Creating…' : 'Create Event'}
                {!loading && <ChevronRight size={16} />}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
