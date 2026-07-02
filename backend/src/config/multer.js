/**
 * Centralised multer configuration.
 * Import `handleEventUpload` as the middleware for any event route
 * that may receive a banner image and/or gallery images.
 *
 * Accepted field names:
 *   image   — single banner image  (maxCount: 1)
 *   gallery — up to 6 gallery images (maxCount: 6)
 */
import multer from 'multer'

const storage = multer.memoryStorage()

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype?.startsWith('image/')) {
    return cb(new Error('Only image files are accepted'), false)
  }
  cb(null, true)
}

const limits = { fileSize: 5 * 1024 * 1024 } // 5 MB

const eventUploader = multer({ storage, fileFilter, limits })

/**
 * Middleware that accepts:
 *   - `image`   : 1 banner image
 *   - `gallery` : up to 6 gallery images
 *
 * Use on POST /events and PUT /events/:id
 */
export const handleEventUpload = eventUploader.fields([
  { name: 'image',   maxCount: 1 },
  { name: 'gallery', maxCount: 6 },
])
