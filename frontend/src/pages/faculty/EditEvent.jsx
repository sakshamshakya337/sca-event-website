import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Calendar, Clock, MapPin, Star, HelpCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import api from '../../config/axios'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'

export default function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [eventData, setEventData] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`)
        const event = res.data.data
        
        // Format date for HTML date input (YYYY-MM-DD)
        let formattedDate = ''
        if (event.date) {
          // Try to parse the date and format it as YYYY-MM-DD
          try {
            const dateObj = new Date(event.date)
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0]
            } else {
              // Try parsing DD/MM/YYYY format
              const parts = event.date.split('/')
              if (parts.length === 3) {
                formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
              } else {
                formattedDate = event.date
              }
            }
          } catch (e) {
            formattedDate = event.date
          }
        }
        
        setEventData({
          title: event.title || '',
          type: event.type || 'Workshop',
          expectedAudience: event.expectedAudience || '',
          date: formattedDate,
          time: event.time || '',
          venue: event.venue || '',
          description: event.description || '',
          registerLink: event.registerLink || '',
          isImportant: Boolean(event.isImportant)
        })
        if (event.imageUrl) {
          setImagePreview(event.imageUrl)
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Unable to load event')
      }
    }

    if (id) loadEvent()
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!eventData) return

    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title', eventData.title)
      payload.append('type', eventData.type)
      payload.append('date', eventData.date)
      if (eventData.time) payload.append('time', eventData.time)
      payload.append('venue', eventData.venue)
      if (eventData.expectedAudience !== '') payload.append('expectedAudience', eventData.expectedAudience)
      payload.append('description', eventData.description)
      payload.append('registerLink', eventData.registerLink)
      payload.append('isImportant', eventData.isImportant ? 'true' : 'false')
      if (imageFile) {
        payload.append('image', imageFile)
      }

      await api.put(`/events/${id}`, payload)
      toast.success('Event updated successfully')
      const editReturnPath = ['admin', 'superadmin'].includes(user?.role) ? `/admin/events/${id}` : `/faculty/events/${id}`
      navigate(editReturnPath)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update event')
    } finally {
      setLoading(false)
    }
  }

  if (!eventData) {
    return (
      <PageWrapper>
        <div className="max-w-[720px] mx-auto py-16 text-center text-on-surface-variant">Loading event details…</div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-[720px] mx-auto">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="bg-surface-container p-6 border-b border-outline-variant">
            <h1 className="text-headline-lg font-bold text-primary">Edit Event</h1>
            <p className="text-body-md text-on-surface-variant mt-2">Update event details, upload a new image, or add a registration link.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Event Title</label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Event Type</label>
                <select
                  value={eventData.type}
                  onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option>Workshop</option>
                  <option>Seminar</option>
                  <option>Cultural</option>
                  <option>Sports</option>
                  <option>Technical</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Expected Audience</label>
                <input
                  type="number"
                  value={eventData.expectedAudience}
                  onChange={(e) => setEventData({ ...eventData, expectedAudience: e.target.value })}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Event Date</label>
                <input
                  type="date"
                  value={eventData.date}
                  onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Event Time</label>
                <input
                  type="time"
                  value={eventData.time}
                  onChange={(e) => setEventData({ ...eventData, time: e.target.value })}
                  className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Venue</label>
              <input
                type="text"
                value={eventData.venue}
                onChange={(e) => setEventData({ ...eventData, venue: e.target.value })}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Registration Link</label>
              <input
                type="url"
                value={eventData.registerLink}
                onChange={(e) => setEventData({ ...eventData, registerLink: e.target.value })}
                placeholder="https://example.com/register"
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface">Description</label>
              <textarea
                value={eventData.description}
                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                rows={5}
                className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface">Event Image</label>
                <p className="text-xs text-on-surface-variant">Recommended: 1200x630px (16:9 ratio) - This image displays at full width without cropping</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setImageFile(file || null)
                    setImagePreview(file ? URL.createObjectURL(file) : eventData.imageUrl || '')
                  }}
                  className="w-full text-body-md"
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="block text-sm font-semibold text-on-surface">Important Event</label>
                <label className="inline-flex items-center gap-3 text-body-md">
                  <input
                    type="checkbox"
                    checked={eventData.isImportant}
                    onChange={(e) => setEventData({ ...eventData, isImportant: e.target.checked })}
                    className="h-4 w-4 rounded border border-outline-variant text-secondary focus:ring-secondary"
                  />
                  Mark as important
                </label>
              </div>
            </div>

            {imagePreview && (
              <div className="rounded-3xl overflow-hidden border border-outline-variant">
                <img src={imagePreview} alt="Event preview" className="w-full h-56 object-cover" />
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-outline-variant px-6 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-secondary px-6 py-3 text-white font-semibold hover:bg-secondary/90 transition-colors disabled:opacity-60"
              >
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>

          <div className="p-6 border-t border-outline-variant bg-surface-container">
            <div className="flex items-start gap-3">
              <HelpCircle size={24} className="text-secondary" />
              <div>
                <p className="font-semibold text-primary">Note</p>
                <p className="text-sm text-on-surface-variant">Updating the event will save the new image and registration link. Approved events may require re-approval after major changes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
