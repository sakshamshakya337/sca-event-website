import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, fmt = 'MMM dd, yyyy') {
  if (!date) return ''
  return format(new Date(date), fmt)
}

export function getCloudinaryUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary.com')) return url

  const {
    width = 200,
    height = 200,
    crop = 'fill',
    gravity = 'face',
    quality = 'auto',
  } = options

  const transformation = `w_${width},h_${height},c_${crop},g_${gravity},q_${quality},f_auto`
  return url.replace('/upload/', `/upload/${transformation}/`)
}
