import crypto from 'crypto'

export const generatePassword = (length = 12) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length)
}

export default generatePassword
