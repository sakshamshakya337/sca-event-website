export const normalizeEventStatus = (status) => {
  const value = status ? String(status).toLowerCase() : 'pending'

  if (['approved', 'approve', 'approved'].includes(value)) return 'approved'
  if (['pending', 'pending approval', 'awaiting approval', 'in review'].includes(value)) return 'pending'
  if (['rejected', 'reject', 'declined'].includes(value)) return 'rejected'
  if (['completed', 'complete'].includes(value)) return 'completed'

  return value
}

export const getEventStatusLabel = (status) => {
  const normalized = normalizeEventStatus(status)

  switch (normalized) {
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'completed':
      return 'Completed'
    case 'pending':
    default:
      return 'Pending'
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
  if (!userId) return false

  const creatorId = typeof event?.createdBy === 'object'
    ? event.createdBy._id?.toString?.()
    : event?.createdBy?.toString?.()

  const assignedFacultyIds = (event?.assignedFaculty || []).map((faculty) =>
    typeof faculty === 'object' ? faculty._id?.toString?.() : faculty?.toString?.()
  )

  return creatorId === userId || assignedFacultyIds.includes(userId)
}
