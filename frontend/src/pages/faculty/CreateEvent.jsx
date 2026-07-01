import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import {
  LayoutDashboard,
  Calendar,
  Plus,
  CheckCircle2,
  Users,
  Search,
  Bell,
  ChevronRight,
  Star,
  MapPin,
  Clock,
  Calendar as CalendarRange,
  ShieldCheck,
  Settings,
  HelpCircle,
  User,
  Link2Off
} from 'lucide-react'
import api from '../../config/axios'
import useAuthStore from '../../store/authStore'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    title: '',
    type: 'Workshop',
    expectedAudience: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    registerLink: '',
    registrationNotRequired: false,
    isImportant: false,
    assignedFaculty: []
  })
  const [facultyList, setFacultyList] = useState([])
  const [loadingFaculty, setLoadingFaculty] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchFaculty = async () => {
      setLoadingFaculty(true)
      try {
        const res = await api.get('/users/faculty')
        setFacultyList(res.data.data || [])
      } catch (err) {
        console.error('Failed to fetch faculty:', err)
      } finally {
        setLoadingFaculty(false)
      }
    }
    fetchFaculty()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = new FormData()
      payload.append('title', formData.title)
      payload.append('type', formData.type)
      payload.append('date', formData.date)
      if (formData.time) payload.append('time', formData.time)
      payload.append('venue', formData.venue)
      if (formData.expectedAudience) payload.append('expectedAudience', formData.expectedAudience)
      if (formData.description) payload.append('description', formData.description)
      if (formData.registerLink) payload.append('registerLink', formData.registerLink)
      payload.append('isImportant', formData.isImportant ? 'true' : 'false')
      payload.append('registrationNotRequired', formData.registrationNotRequired ? 'true' : 'false')
      if (formData.assignedFaculty.length > 0) {
        payload.append('assignedFaculty', JSON.stringify(formData.assignedFaculty))
      }
      if (imageFile) payload.append('image', imageFile)

      await api.post('/events', payload)
      alert('Event created successfully. It is now pending admin approval.')
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        navigate('/admin')
      } else {
        navigate('/faculty')
      }
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-[720px] mx-auto">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-outline-variant bg-surface-container-low">
            <h2 className="text-headline-lg text-primary">Create New Event</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Enter the official details to register this event into the University Management System.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-headline-sm text-primary block">Event Title</label>
              <input
                className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
                placeholder="Enter formal event name"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-headline-sm text-primary block">Event Type</label>
                <select
                  className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none appearance-none"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
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
                <label className="text-headline-sm text-primary block">Expected Audience</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                    type="number"
                    value={formData.expectedAudience}
                    onChange={(e) => setFormData({ ...formData, expectedAudience: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-headline-sm text-primary block">Event Date</label>
                <div className="relative">
                  <CalendarRange className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-headline-sm text-primary block">Event Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                  <input
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <label className="text-headline-sm text-primary block">Venue</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
                <input
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                  placeholder="Enter precise location"
                  type="text"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-headline-sm text-primary block">Description</label>
              <textarea
                className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            {/* Register Link and Image Upload */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-headline-sm text-primary block">Registration Link</label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                  placeholder="https://example.com/register"
                  type="url"
                  value={formData.registerLink}
                  onChange={(e) => setFormData({ ...formData, registerLink: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-headline-sm text-primary block">Event Image (optional)</label>
                <p className="text-xs text-on-surface-variant">Recommended: 1200x630px (16:9 ratio)</p>
                <input
                  className="w-full text-body-md file:border-0 file:bg-secondary/10 file:px-4 file:py-2 file:rounded-lg file:text-secondary file:font-semibold"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    setImageFile(file || null)
                    setImagePreview(file ? URL.createObjectURL(file) : null)
                  }}
                />
                {imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-outline-variant shadow-sm">
                    <img src={imagePreview} alt="Event preview" className="w-full h-40 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Toggle Section - Mark as Important */}
            <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-xl border border-secondary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                  <Star size={20} fill="currentColor" />
                </div>
                <div>
                  <p className="text-headline-sm text-primary leading-tight">Mark as Important</p>
                  <p className="text-body-sm text-on-surface-variant">Flag for priority scheduling</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            {/* Toggle Section - Registration Not Required */}
            <div className="flex items-center justify-between p-4 bg-error/5 rounded-xl border border-error/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error">
                  <Link2Off size={20} />
                </div>
                <div>
                  <p className="text-headline-sm text-primary leading-tight">Registration Not Required</p>
                  <p className="text-body-sm text-on-surface-variant">Hide registration link from public page</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.registrationNotRequired}
                  onChange={(e) => setFormData({ ...formData, registrationNotRequired: e.target.checked })}
                />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-error"></div>
              </label>
            </div>

            {/* Assigned Faculty */}
            <div className="space-y-2">
              <label className="text-headline-sm text-primary block">Assign Faculty (Optional)</label>
              <p className="text-xs text-on-surface-variant">Select faculty to assign to this event</p>
              <div className="max-h-48 overflow-y-auto border border-outline-variant rounded-lg p-2 space-y-2">
                {loadingFaculty ? (
                  <p className="text-body-sm text-on-surface-variant p-2">Loading faculty...</p>
                ) : facultyList.length === 0 ? (
                  <p className="text-body-sm text-on-surface-variant p-2">No faculty found</p>
                ) : (
                  facultyList.map((faculty) => (
                    <label
                      key={faculty._id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-high cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-secondary rounded border-outline focus:ring-secondary"
                        checked={formData.assignedFaculty.includes(faculty._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              assignedFaculty: [...formData.assignedFaculty, faculty._id]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              assignedFaculty: formData.assignedFaculty.filter(id => id !== faculty._id)
                            })
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white text-xs font-bold">
                          {faculty.firstName?.[0] || ''}{faculty.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="text-body-sm font-medium">{faculty.firstName} {faculty.lastName}</p>
                          <p className="text-xs text-on-surface-variant">{faculty.employeeId || 'N/A'}</p>
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant">
              <button
                onClick={() => {
                  if (user?.role === 'admin' || user?.role === 'superadmin') {
                    navigate('/admin')
                  } else {
                    navigate('/faculty')
                  }
                }}
                className="px-8 h-11 border border-outline-variant text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container transition-colors flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                className="px-8 h-11 bg-secondary text-white font-bold rounded-lg hover:shadow-lg hover:shadow-secondary/20 transition-all flex items-center gap-2 active:scale-95"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}