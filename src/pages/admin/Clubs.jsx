// src/pages/admin/Clubs.jsx
import { useEffect, useState } from 'react'
import { Plus, Users, Shield, UserCheck, Trash2, Edit3 } from 'lucide-react'
import axiosInstance from '../../config/axios'
import PageWrapper from '../../components/layout/PageWrapper'
import toast from 'react-hot-toast'

export default function AdminClubs() {
  const [clubs, setClubs] = useState([])
  const [faculty, setFaculty] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showManageModal, setShowManageModal] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)

  // Form states
  const [clubName, setClubName] = useState('')
  const [clubDescription, setClubDescription] = useState('')
  const [facultyCoordinatorId, setFacultyCoordinatorId] = useState('')

  // Member assignment states
  const [selectedAction, setSelectedAction] = useState('add_member')
  const [targetUserId, setTargetUserId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [clubsRes, usersRes] = await Promise.all([
        axiosInstance.get('/clubs'),
        axiosInstance.get('/users') // assuming this endpoint lists all users
      ])
      setClubs(clubsRes.data.data)
      const allUsers = usersRes.data.data || []
      setFaculty(allUsers.filter(u => ['faculty', 'faculty_coordinator'].includes(u.role)))
      setStudents(allUsers.filter(u => ['student', 'club_president', 'club_vice_president'].includes(u.role)))
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClub = async (e) => {
    e.preventDefault()
    if (!clubName.trim()) {
      toast.error('Club name is required')
      return
    }
    try {
      await axiosInstance.post('/clubs', {
        name: clubName,
        description: clubDescription,
        facultyCoordinatorId: facultyCoordinatorId || null
      })
      toast.success('Club created successfully')
      setShowCreateModal(false)
      setClubName('')
      setClubDescription('')
      setFacultyCoordinatorId('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create club')
    }
  }

  const handleManageMembers = async (e) => {
    e.preventDefault()
    if (!targetUserId) {
      toast.error('Please select a student')
      return
    }
    try {
      await axiosInstance.post('/clubs/members', {
        clubId: selectedClub._id,
        action: selectedAction,
        userId: targetUserId
      })
      toast.success('Club membership updated')
      setShowManageModal(false)
      setTargetUserId('')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    }
  }

  return (
    <PageWrapper>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Club Management</h1>
            <p className="text-on-surface-variant mt-1">Create clubs, assign coordinators, and manage leadership roles.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#E87722] hover:bg-[#d0661b] text-white font-semibold rounded-btn transition-colors"
          >
            <Plus size={18} />
            Create Club
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2].map(i => (
              <div key={i} className="h-48 bg-surface-container animate-pulse rounded-card" />
            ))}
          </div>
        ) : clubs.length === 0 ? (
          <div className="bg-surface-card border border-outline-variant p-16 text-center rounded-card">
            <Users size={48} className="text-[#E87722] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-on-surface">No clubs defined</h3>
            <p className="text-on-surface-variant mt-2">Get started by creating the first club.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clubs.map(club => (
              <div key={club._id} className="bg-surface-card rounded-card border border-outline-variant p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">{club.name}</h3>
                    <p className="text-xs text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">
                      /{club.slug}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClub(club)
                      setShowManageModal(true)
                    }}
                    className="flex items-center gap-1 text-sm text-[#E87722] hover:underline font-semibold"
                  >
                    <Edit3 size={14} />
                    Manage
                  </button>
                </div>

                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">{club.description || 'No description provided.'}</p>

                <div className="space-y-2 border-t border-outline-variant pt-4 text-sm text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Faculty Coordinator:</span>
                    <span className="font-semibold text-on-surface">
                      {club.facultyCoordinator ? `${club.facultyCoordinator.firstName} ${club.facultyCoordinator.lastName}` : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Club President:</span>
                    <span className="font-semibold text-on-surface">
                      {club.president ? `${club.president.firstName} ${club.president.lastName}` : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vice President:</span>
                    <span className="font-semibold text-on-surface">
                      {club.vicePresident ? `${club.vicePresident.firstName} ${club.vicePresident.lastName}` : 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Members:</span>
                    <span className="font-semibold text-on-surface">{(club.members || []).length} registered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Club Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-card rounded-card border border-outline-variant p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-on-surface mb-4">Create New Club</h2>
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Club Name *</label>
                  <input
                    type="text"
                    value={clubName}
                    onChange={e => setClubName(e.target.value)}
                    placeholder="e.g. CodeCraft"
                    className="w-full px-3 py-2 border border-outline-variant bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                  <textarea
                    value={clubDescription}
                    onChange={e => setClubDescription(e.target.value)}
                    placeholder="Describe the club's main objectives..."
                    rows={3}
                    className="w-full px-3 py-2 border border-outline-variant bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Faculty Coordinator</label>
                  <select
                    value={facultyCoordinatorId}
                    onChange={e => setFacultyCoordinatorId(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  >
                    <option value="">Select Faculty...</option>
                    {faculty.map(f => (
                      <option key={f._id} value={f._id}>{f.firstName} {f.lastName} ({f.designation || 'Faculty'})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-on-surface-variant border border-outline-variant rounded-btn hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-[#E87722] text-white rounded-btn hover:bg-[#d0661b]"
                  >
                    Save Club
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Manage Members Modal */}
        {showManageModal && selectedClub && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface-card rounded-card border border-outline-variant p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-on-surface mb-2">Manage {selectedClub.name}</h2>
              <p className="text-xs text-on-surface-variant mb-4">Assign leadership positions or register members.</p>
              <form onSubmit={handleManageMembers} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Select Action</label>
                  <select
                    value={selectedAction}
                    onChange={e => setSelectedAction(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                  >
                    <option value="set_president">Assign President</option>
                    <option value="set_vice_president">Assign Vice President</option>
                    <option value="add_member">Add Student to Club</option>
                    <option value="remove_member">Remove Student from Club</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Select Student</label>
                  <select
                    value={targetUserId}
                    onChange={e => setTargetUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant bg-surface rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E87722]"
                    required
                  >
                    <option value="">Select Student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.registrationNumber})</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManageModal(false)}
                    className="px-4 py-2 text-sm text-on-surface-variant border border-outline-variant rounded-btn hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-semibold bg-[#E87722] text-white rounded-btn hover:bg-[#d0661b]"
                  >
                    Confirm Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
