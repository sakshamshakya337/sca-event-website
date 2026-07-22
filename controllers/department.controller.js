import Department from '../models/Department.js'
import User from '../models/User.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'
import mongoose from 'mongoose'

// @desc    Create a new department
// @route   POST /api/departments
// @access  Super Admin
export const createDepartment = async (req, res, next) => {
  try {
    const { departmentName, departmentCode } = req.body

    if (!departmentName || !departmentCode) {
      return next(new ApiError(400, 'Department name and code are required'))
    }

    const existingCode = await Department.findOne({ departmentCode: departmentCode.toUpperCase() })
    if (existingCode) {
      return next(new ApiError(400, 'Department code already exists'))
    }

    const department = await Department.create({
      departmentName,
      departmentCode: departmentCode.toUpperCase()
    })

    res.status(201).json(new ApiResponse(201, department, 'Department created successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public / Authenticated
export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ status: 'active' }).populate('hodIds', 'firstName lastName officialEmail')
    res.status(200).json(new ApiResponse(200, departments, 'Departments retrieved successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Super Admin
export const updateDepartment = async (req, res, next) => {
  try {
    const { departmentName, departmentCode, status } = req.body

    const department = await Department.findById(req.params.id)
    if (!department) {
      return next(new ApiError(404, 'Department not found'))
    }

    if (departmentCode && departmentCode.toUpperCase() !== department.departmentCode) {
      const existingCode = await Department.findOne({ departmentCode: departmentCode.toUpperCase() })
      if (existingCode) {
        return next(new ApiError(400, 'Department code already exists'))
      }
      department.departmentCode = departmentCode.toUpperCase()
    }

    if (departmentName) department.departmentName = departmentName
    if (status) department.status = status

    await department.save()

    res.status(200).json(new ApiResponse(200, department, 'Department updated successfully'))
  } catch (error) {
    next(error)
  }
}

// @desc    Assign HODs to a department
// @route   PUT /api/departments/:id/assign-hods
// @access  Super Admin
export const assignHod = async (req, res, next) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { hodIds } = req.body // array of user IDs
    
    if (!Array.isArray(hodIds)) {
      return next(new ApiError(400, 'hodIds must be an array of faculty IDs'))
    }

    const department = await Department.findById(req.params.id).session(session)
    if (!department) {
      throw new ApiError(404, 'Department not found')
    }

    const currentHodIds = department.hodIds ? department.hodIds.map(id => id.toString()) : []
    const newHodIds = hodIds.map(id => id.toString())

    // 1. Find HODs that were removed
    const removedHodIds = currentHodIds.filter(id => !newHodIds.includes(id))
    for (const id of removedHodIds) {
      const oldHod = await User.findById(id).session(session)
      if (oldHod && oldHod.role === 'hod') {
        // Demote back to faculty if they aren't HOD of another department
        const otherDepts = await Department.findOne({ _id: { $ne: department._id }, hodIds: id }).session(session)
        if (!otherDepts) {
          oldHod.role = 'faculty'
          await oldHod.save({ session })
        }
      }
    }

    // 2. Find HODs that were added
    const addedHodIds = newHodIds.filter(id => !currentHodIds.includes(id))
    for (const id of addedHodIds) {
      const faculty = await User.findById(id).session(session)
      if (!faculty || (faculty.role !== 'faculty' && faculty.role !== 'hod')) {
        throw new ApiError(400, `User ${id} is not a valid faculty member`)
      }
      faculty.role = 'hod'
      faculty.departmentId = department._id
      faculty.departmentCode = department.departmentCode
      await faculty.save({ session })
    }

    // 3. Update department
    department.hodIds = newHodIds
    await department.save({ session })

    await session.commitTransaction()
    session.endSession()

    res.status(200).json(new ApiResponse(200, department, 'HODs assigned successfully'))
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    next(error)
  }
}

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Super Admin
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
    if (!department) {
      return next(new ApiError(404, 'Department not found'))
    }

    // Check if faculty belong to this department
    const facultyCount = await User.countDocuments({ departmentId: department._id })
    if (facultyCount > 0) {
      return next(new ApiError(400, 'Cannot delete department with assigned faculty members. Reassign them first.'))
    }

    await department.deleteOne()

    res.status(200).json(new ApiResponse(200, {}, 'Department deleted successfully'))
  } catch (error) {
    next(error)
  }
}
