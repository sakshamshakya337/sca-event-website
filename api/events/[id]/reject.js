// /api/events/:id/reject
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function rejectHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, action: 'reject' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
