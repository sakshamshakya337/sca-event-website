// /api/users/students
import handler, { config as _config } from './index.js';
export { _config as config };

export default async function studentsHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'students' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
