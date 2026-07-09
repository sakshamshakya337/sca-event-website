import Gallery from '../models/Gallery.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import mongoose from 'mongoose'
import cloudinary from '../config/cloudinary.js'
import { handleEventUpload } from '../config/multer.js'

export { handleEventUpload as uploadGalleryFields }

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(new ApiError(400, error.message || 'Failed to upload image'))
        else resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

// @desc    Create a new gallery
// @route   POST /api/galleries
// @access  Private/Admin
export const createGallery = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate } = req.body
    let { bannerImage, images } = req.body

    // Handle banner image upload if file is provided
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const uploadResult = await uploadToCloudinary(req.files.image[0].buffer, { folder: 'sca-galleries' })
        bannerImage = uploadResult.secure_url
      } catch (err) {
        console.warn('⚠️ Cloudinary upload failed in createGallery, falling back to base64 Data URL:', err.message)
        const mimeType = req.files.image[0].mimetype || 'image/png'
        const base64Data = req.files.image[0].buffer.toString('base64')
        bannerImage = `data:${mimeType};base64,${base64Data}`
      }
    }

    if (!bannerImage) {
      return next(new ApiError(400, 'Please provide a banner image or upload a file'))
    }

    if (!startDate || !endDate) {
      return next(new ApiError(400, 'Please provide event start and end dates'))
    }

    // Ensure images is an array
    if (typeof images === 'string') {
      images = [images]
    } else if (!images) {
      images = []
    }

    // Filter out empty strings
    images = images.filter(url => url.trim() !== '')

    const gallery = await Gallery.create({
      title,
      description,
      startDate,
      endDate,
      bannerImage,
      images,
      createdBy: req.user._id
    })

    res.status(201).json(new ApiResponse(201, gallery, 'Gallery created successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Get all galleries
// @route   GET /api/galleries
// @access  Public
export const getGalleries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const skip = (page - 1) * limit

    const galleries = await Gallery.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Gallery.countDocuments()

    res.status(200).json(new ApiResponse(200, {
      galleries,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }, 'Galleries retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Get gallery by ID
// @route   GET /api/galleries/:id
// @access  Public
export const getGalleryById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid Gallery ID'))
    }

    const gallery = await Gallery.findById(req.params.id).populate('createdBy', 'firstName lastName')
    if (!gallery) {
      return next(new ApiError(404, 'Gallery not found'))
    }

    res.status(200).json(new ApiResponse(200, gallery, 'Gallery retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Update gallery
// @route   PUT /api/galleries/:id
// @access  Private/Admin
export const updateGallery = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid Gallery ID'))
    }

    const { title, description, startDate, endDate } = req.body
    let { bannerImage, images } = req.body

    // Handle banner image upload if file is provided
    if (req.files && req.files.image && req.files.image[0]) {
      try {
        const uploadResult = await uploadToCloudinary(req.files.image[0].buffer, { folder: 'sca-galleries' })
        bannerImage = uploadResult.secure_url
      } catch (err) {
        console.warn('⚠️ Cloudinary upload failed in updateGallery, falling back to base64 Data URL:', err.message)
        const mimeType = req.files.image[0].mimetype || 'image/png'
        const base64Data = req.files.image[0].buffer.toString('base64')
        bannerImage = `data:${mimeType};base64,${base64Data}`
      }
    }

    // Ensure images is an array
    if (typeof images === 'string') {
      images = [images]
    } else if (!images) {
      images = undefined
    }

    if (images !== undefined) {
      // Filter out empty strings
      images = images.filter(url => url.trim() !== '')
    }

    const updateData = {}
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (startDate) updateData.startDate = startDate
    if (endDate) updateData.endDate = endDate
    if (bannerImage) updateData.bannerImage = bannerImage
    if (images !== undefined) updateData.images = images

    const gallery = await Gallery.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })

    if (!gallery) {
      return next(new ApiError(404, 'Gallery not found'))
    }

    res.status(200).json(new ApiResponse(200, gallery, 'Gallery updated successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Delete gallery
// @route   DELETE /api/galleries/:id
// @access  Private/Admin
export const deleteGallery = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new ApiError(400, 'Invalid Gallery ID'))
    }

    const gallery = await Gallery.findById(req.params.id)

    if (!gallery) {
      return next(new ApiError(404, 'Gallery not found'))
    }

    await gallery.deleteOne()

    res.status(200).json(new ApiResponse(200, {}, 'Gallery deleted successfully'))
  } catch (error) {
    next(error)
  }
}
