import { z } from 'zod'

export const studentDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  personalEmail: z.string().email('Invalid email'),
  phone: z.string().optional(),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  program: z.string().min(1, 'Program is required'),
  degree: z.string().min(1, 'Degree is required'),
  semester: z.string().min(1, 'Semester is required'),
  section: z.string().min(1, 'Section is required'),
})

export const facultyDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  personalEmail: z.string().email('Invalid email'),
  officialEmail: z.string().email('Invalid official email'),
  phone: z.string().optional(),
  employeeId: z.string().min(1, 'Employee ID is required'),
  department: z.string().min(1, 'Department is required'),
  designation: z.string().min(1, 'Designation is required'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1, 'CalendarDays type is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  venue: z.string().min(1, 'Venue is required'),
  expectedAudience: z.number().int().positive().optional(),
  description: z.string().optional(),
  isImportant: z.boolean().default(false),
})

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})
