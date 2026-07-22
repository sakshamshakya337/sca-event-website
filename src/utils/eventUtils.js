export const normalizeEventStatus = (status) => {
  const value = status ? String(status).toLowerCase() : 'pending'

  if (['approved', 'approve', 'published'].includes(value)) return 'approved'
  if (['pending', 'pending approval', 'awaiting approval', 'in review', 'pending_admin', 'pending_dean', 'pending_hos', 'pending_hod'].includes(value)) return 'pending'
  if (['rejected', 'reject', 'declined'].includes(value)) return 'rejected'
  if (['completed', 'complete'].includes(value)) return 'completed'

  return value
}

export const getEventStatusLabel = (status) => {
  const normalized = normalizeEventStatus(status)

  if (normalized === 'pending') {
    const s = String(status).toLowerCase()
    if (s === 'pending_admin' || s === 'pending') return 'Pending (Admin)'
    if (s === 'pending_dean') return 'Pending (Dean)'
    if (s === 'pending_hos') return 'Pending (HOS)'
    if (s === 'pending_hod') return 'Pending (HOD)'
    return 'Pending'
  }

  switch (normalized) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'completed':
      return 'Completed'
    default:
      return 'Unknown'
  }
}

export const getEventCreatorName = (createdBy) => {
  if (!createdBy) return 'Unknown'

  if (typeof createdBy === 'string') return createdBy

  if (typeof createdBy === 'object') {
    const fullName = [createdBy.firstName, createdBy.lastName].filter(Boolean).join(' ').trim()
    return fullName || createdBy.name || 'Unknown'
  }

  return 'Unknown'
}

export const getUserId = (user) => {
  if (!user) return null
  return user._id?.toString?.() || user.id?.toString?.() || user.userId?.toString?.() || null
}

export const isEventVisibleToFaculty = (event, user) => {
  const userId = getUserId(user)
  if (!userId || !event) return false

  const createdBy = event?.createdBy
  const creatorId = createdBy
    ? (typeof createdBy === 'object' ? createdBy._id?.toString?.() : createdBy?.toString?.())
    : null

  const assignedFacultyIds = (event?.assignedFaculty || []).map((faculty) =>
    typeof faculty === 'object' ? faculty._id?.toString?.() : faculty?.toString?.()
  )

  return creatorId === userId || assignedFacultyIds.includes(userId)
}

export const formatDateDMY = (dateVal) => {
  if (!dateVal) return ''
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return dateVal
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}`
  } catch {
    return dateVal
  }
}
