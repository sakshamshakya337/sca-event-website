import { v4 as uuidv4 } from 'uuid'

export const generateRefNumber = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = uuidv4().split('-')[0].toUpperCase()
  return `SCA-${year}-${month}-${random}`
}

export default generateRefNumber
