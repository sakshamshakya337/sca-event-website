// /api/events/:id/approve
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function approveHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, action: 'approve' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
