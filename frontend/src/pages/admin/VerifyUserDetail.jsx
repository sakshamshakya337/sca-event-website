import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper'
import { MdArrowBack, MdInfo, MdCheckCircle, MdCancel, MdAccountBox, MdOpenInNew, MdForwardToInbox } from 'react-icons/md'
import useAdminVerifyStore from '../../store/adminVerifyStore'
import api from '../../config/axios'

export default function VerifyUserDetail() {
  const { id } = useParams()
  const [notes, setNotes] = useState('')
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Registration number matches the provided University ID card', checked: false },
    { id: 2, label: 'Full name on application matches official documentation', checked: false },
    { id: 3, label: 'Photograph provided is clear and recognizable', checked: false },
    { id: 4, label: 'Current semester and section are within valid ranges', checked: false },
  ])
  const { approveVerification, rejectVerification } = useAdminVerifyStore()
  const [verification, setVerification] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await api.get(`/verification/${id}`)
        setVerification(res.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchVerification()
  }, [id])

  if (loading) return <div className="p-6">Loading...</div>
  if (!verification) return <div className="p-6">User not found</div>

  const user = verification.user || {}

  const toggleChecklist = (itemId) => {
    setChecklist(checklist.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item))
  }

  const handleApprove = async () => {
    try {
      await approveVerification(id, notes, checklist)
      setVerification(v => ({ ...v, status: 'approved' }))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleReject = async () => {
    try {
      await rejectVerification(id, notes, checklist)
      setVerification(v => ({ ...v, status: 'rejected' }))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link to="/admin/verify" className="flex items-center gap-2 text-secondary hover:underline">
            <MdArrowBack size={20} />
            Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                <MdAccountBox size={24} className="text-primary" />
                <h2 className="text-headline-lg font-headline-lg text-primary">Applicant Details</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Full Name</p>
                    <p className="text-body-lg font-semibold text-primary">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Role</p>
                    <p className="text-body-lg font-semibold text-primary capitalize">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">University ID</p>
                    <p className="text-body-lg font-code-lg font-semibold">{verification.referenceNumber}</p>
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Registration Number</p>
                    <p className="text-body-lg font-code-lg font-semibold">{user.registrationNumber || user.employeeId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Department</p>
                    <p className="text-body-lg font-semibold">{user.department || '-'}</p>
                  </div>
                  {user.semester && (
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface-variant">Semester</p>
                      <p className="text-body-lg font-semibold">{user.semester}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Contact Email</p>
                    <p className="text-body-lg font-semibold text-secondary hover:underline cursor-pointer">
                      {user.personalEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface-variant">Phone</p>
                    <p className="text-body-lg font-semibold">{user.phone || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                <MdInfo size={24} className="text-secondary" />
                <h3 className="text-headline-sm font-headline-sm text-primary">Verification Checklist</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {checklist.map(item => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        item.checked
                          ? 'bg-secondary/5 border-secondary/30'
                          : 'border-outline-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggleChecklist(item.id)}
                        className="w-5 h-5 rounded border-outline text-secondary focus:ring-secondary transition-all"
                      />
                      <span className="text-body-md font-body-md text-primary">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-outline-variant rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-outline-variant">
                <h3 className="text-headline-sm font-headline-sm text-primary">Admin Notes</h3>
              </div>
              <div className="p-6">
                <textarea
                  className="w-full h-32 rounded-lg border border-outline-variant bg-surface-container focus:ring-2 focus:ring-secondary/20 focus:outline-none p-4 text-body-md font-body-md"
                  placeholder="Enter private observations or reasoning for rejection/approval here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-3 flex items-center gap-2 text-on-surface-variant text-[11px] font-medium">
                  <MdInfo size={16} />
                  Notes are only visible to other administrators and faculty.
                </div>
              </div>
            </div>

            {verification.status === 'pending' && (
              <div className="flex gap-4 justify-end">
                <button
                  onClick={handleReject}
                  className="px-6 py-3 bg-error text-white rounded-lg font-headline-md hover:bg-error/90 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MdCancel size={20} />
                  Reject Application
                </button>
                <button
                  onClick={handleApprove}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-headline-md hover:bg-green-700 transition-all active:scale-95 flex items-center gap-2"
                >
                  <MdCheckCircle size={20} />
                  Approve Application
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-outline-variant rounded-xl shadow-sm">
              <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-lg">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-headline-sm font-headline-sm text-primary">Current Status</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                    verification.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    verification.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {verification.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-amber-700"></div>}
                    {verification.status === 'approved' && <MdCheckCircle size={14} />}
                    {verification.status === 'rejected' && <MdCancel size={14} />}
                    {verification.status}
                  </span>
                </div>
              </div>
              <div className="p-6 bg-primary-container text-on-primary-container border-t border-primary/10">
                <div className="flex items-start gap-3">
                  <MdForwardToInbox size={24} className="text-white/70" />
                  <div>
                    <h4 className="font-bold text-headline-sm">Decision Workflow</h4>
                    <p className="font-body-md opacity-90 mt-1">
                      Upon submitting your final decision, an automated notification will be sent to the student's personal and university email addresses.
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-white/70 text-[12px] italic">
                      <MdInfo size={16} />
                      Review history will be logged for administrative auditing.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {verification.universityIdUrl && (
              <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                  <h3 className="text-headline-sm font-headline-sm text-primary">ID Card Document</h3>
                  <a href={verification.universityIdUrl} target="_blank" rel="noopener noreferrer" className="text-secondary font-bold text-[12px] hover:underline flex items-center gap-1">
                    View Full Size <MdOpenInNew size={14} />
                  </a>
                </div>
                <div className="p-6">
                  <img src={verification.universityIdUrl} alt="University ID" className="w-full rounded-lg" />
                </div>
              </div>
            )}

            {verification.profilePhotoUrl && (
              <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-outline-variant">
                  <h3 className="text-headline-sm font-headline-sm text-primary">Profile Photo</h3>
                </div>
                <div className="p-6">
                  <img src={verification.profilePhotoUrl} alt="Profile" className="w-full max-w-[200px] mx-auto rounded-lg" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
