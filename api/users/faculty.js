// /api/users/faculty
import handler, { config as _config } from './index.js';
export { _config as config };

export default async function facultyHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'faculty' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
