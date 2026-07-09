// /api/events/:id/assign-students
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function assignStudentsHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, action: 'assign-students' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
