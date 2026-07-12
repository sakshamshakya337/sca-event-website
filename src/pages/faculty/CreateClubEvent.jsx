// src/pages/faculty/CreateClubEvent.jsx
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

export default function CreateClubEvent() {
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
    startTime: '',
    endTime: '',
    venue: '',
    description: '',
    registerLink: '',
    registrationNotRequired: false,
    registrationOpen: false,
    isImportant: false,
    assignedFaculty: [],
  })

  const [externalImageUrls, setExternalImageUrls] = useState(['', '']) // 2 poster inputs

  const [facultyList,    setFacultyList]    = useState([])
  const [loadingFaculty, setLoadingFaculty] = useState(false)
  const [imageFile,      setImageFile]      = useState(null)
  const [imagePreview,   setImagePreview]   = useState(null)
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

  // Handle gallery add
  const handleGalleryAdd = (e) => {
    const slots = 6 - galleryFiles.length
    if (slots <= 0) { toast.error('Maximum 6 gallery images allowed.'); return }
    const files = Array.from(e.target.files).slice(0, slots)
    setGalleryFiles(prev => [...prev, ...files])
    e.target.value = ''
  }

  const removeGalleryFile = (idx) =>
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx))

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title',                   formData.title)
      payload.append('type',                    formData.type)
      payload.append('startDate',               formData.startDate)
      payload.append('endDate',                 formData.endDate)
      const timeVal = formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : (formData.time || '')
      if (timeVal)                  payload.append('time',            timeVal)
      if (formData.startTime)       payload.append('startTime',       formData.startTime)
      if (formData.endTime)         payload.append('endTime',         formData.endTime)
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

      // Club specific fields
      payload.append('eventType', 'club')
      payload.append('clubId', user?.clubId || '')

      // Add external image URLs
      const validUrls = externalImageUrls.filter(url => url.trim().length > 0).slice(0, 2)
      payload.append('externalImageUrls', JSON.stringify(validUrls))

      await api.post('/events', payload)
      toast.success('Club event created! Pending admin approval.')
      navigate('/faculty')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club event')
    } finally {
      setLoading(false)
    }
  }

  const set = (k, v) => setFormData(d => ({ ...d, [k]: v }))
  const toggleFaculty = (id, checked) =>
    set('assignedFaculty', checked
      ? [...formData.assignedFaculty, id]
      : formData.assignedFaculty.filter(x => x !== id))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-[760px] mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">

          {/* Header */}
          <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-outline-variant bg-surface-container-low">
            <h2 className="text-lg sm:text-xl font-bold text-primary">Create New Club Event</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Create a designated event for your club. It will go through the multi-stage approval chain.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">Event Title *</label>
              <input className={inp} placeholder="Enter club event name" type="text"
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
                  <input className={`${inp} pl-11`} type="number" placeholder="e.g. 150"
                    value={formData.expectedAudience} onChange={e => set('expectedAudience', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Dates & Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
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
                <label className="text-sm font-semibold text-on-surface block">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input className={`${inp} pl-11`} type="time"
                    value={formData.startTime} onChange={e => set('startTime', e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-on-surface block">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                  <input className={`${inp} pl-11`} type="time"
                    value={formData.endTime} onChange={e => set('endTime', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">Venue *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input className={`${inp} pl-11`} placeholder="e.g. Block 34, Room 102" type="text"
                  value={formData.venue} onChange={e => set('venue', e.target.value)} required />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-on-surface block">Description</label>
              <textarea className="w-full min-h-[120px] p-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all resize-y"
                placeholder="Details about the club event..." value={formData.description} onChange={e => set('description', e.target.value)} />
            </div>

            {/* Image Banner */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface block">Event Banner Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary/10 file:text-secondary hover:file:bg-secondary/20" />
              {imagePreview && (
                <div className="mt-3 relative w-full h-40 bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Poster Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-on-surface block">Poster Images (optional)</label>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Provide up to 2 poster image URLs to display in the carousel.
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                  externalImageUrls.filter(url => url.trim().length > 0).length >= 2 ? 'bg-red-100 text-red-700' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {externalImageUrls.filter(url => url.trim().length > 0).length}/2
                </span>
              </div>

              <div className="space-y-2">
                {externalImageUrls.map((url, i) => (
                  <input
                    key={i}
                    type="url"
                    placeholder={`Poster Image URL ${i + 1}`}
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
              <button type="button" onClick={() => navigate('/faculty')} className="h-12 px-6 border border-outline text-on-surface-variant rounded-btn text-sm font-semibold hover:bg-surface-container transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="h-12 px-8 bg-[#E87722] text-white font-bold rounded-btn text-sm hover:bg-[#d0661b] transition-all disabled:opacity-50">
                {loading ? 'Creating...' : 'Create Event'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
