// /api/events/:id/assign-faculty
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function assignFacultyHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, action: 'assign-faculty' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
