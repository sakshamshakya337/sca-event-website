import { connectDB } from '../../lib/db.js';
import { protect, authorize } from '../../lib/auth.js';
import Gallery from '../../lib/models/Gallery.js';
import { ApiError, ApiResponse } from '../../lib/response.js';
import cloudinary from '../../lib/cloudinary.js';
import mongoose from 'mongoose';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadToCloudinary = async (filePath, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(new ApiError(400, error.message || 'Failed to upload image'));
        else resolve(result);
      }
    );
  });
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await connectDB();

    const { id } = req.query;

    if (req.method === 'GET') {
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new ApiError(400, 'Invalid Gallery ID');
        }
        const gallery = await Gallery.findById(id).populate('createdBy', 'firstName lastName');
        if (!gallery) {
          throw new ApiError(404, 'Gallery not found');
        }
        return res.status(200).json(new ApiResponse(200, gallery, 'Gallery retrieved successfully'));
      } else {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const galleries = await Gallery.find()
          .populate('createdBy', 'firstName lastName')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const total = await Gallery.countDocuments();
        return res.status(200).json(new ApiResponse(200, {
          galleries,
          pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
          }
        }, 'Galleries retrieved successfully'));
      }
    }

    // Protect all write methods
    const user = await protect(req);
    authorize(user, 'admin', 'superadmin');

    if (req.method === 'POST') {
      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      const [fields, files] = await form.parse(req);

      const title = fields.title?.[0];
      const description = fields.description?.[0];
      const startDate = fields.startDate?.[0];
      const endDate = fields.endDate?.[0];
      let bannerImage = fields.bannerImage?.[0];
      let images = fields.images || [];

      if (files.image && files.image[0]) {
        const uploadResult = await uploadToCloudinary(files.image[0].filepath, { folder: 'sca-galleries' });
        bannerImage = uploadResult.secure_url;
      }

      if (!bannerImage) {
        throw new ApiError(400, 'Please provide a banner image or upload a file');
      }

      if (!startDate || !endDate) {
        throw new ApiError(400, 'Please provide event start and end dates');
      }

      if (typeof images === 'string') {
        images = [images];
      }
      images = images.filter(url => url && url.trim() !== '');

      const gallery = await Gallery.create({
        title,
        description,
        startDate,
        endDate,
        bannerImage,
        images,
        createdBy: user._id
      });

      return res.status(201).json(new ApiResponse(201, gallery, 'Gallery created successfully'));

    } else if (req.method === 'PUT') {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid Gallery ID');
      }

      const form = formidable({ maxFileSize: 10 * 1024 * 1024 });
      const [fields, files] = await form.parse(req);

      const title = fields.title?.[0];
      const description = fields.description?.[0];
      const startDate = fields.startDate?.[0];
      const endDate = fields.endDate?.[0];
      let bannerImage = fields.bannerImage?.[0];
      let images = fields.images;

      if (files.image && files.image[0]) {
        const uploadResult = await uploadToCloudinary(files.image[0].filepath, { folder: 'sca-galleries' });
        bannerImage = uploadResult.secure_url;
      }

      if (typeof images === 'string') {
        images = [images];
      }
      if (images !== undefined) {
        images = images.filter(url => url && url.trim() !== '');
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (startDate) updateData.startDate = startDate;
      if (endDate) updateData.endDate = endDate;
      if (bannerImage) updateData.bannerImage = bannerImage;
      if (images !== undefined) updateData.images = images;

      const gallery = await Gallery.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
      });

      if (!gallery) {
        throw new ApiError(404, 'Gallery not found');
      }

      return res.status(200).json(new ApiResponse(200, gallery, 'Gallery updated successfully'));

    } else if (req.method === 'DELETE') {
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid Gallery ID');
      }

      const gallery = await Gallery.findById(id);
      if (!gallery) {
        throw new ApiError(404, 'Gallery not found');
      }

      await gallery.deleteOne();
      return res.status(200).json(new ApiResponse(200, {}, 'Gallery deleted successfully'));

    } else {
      return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (err) {
    const status = err.statusCode || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
}
