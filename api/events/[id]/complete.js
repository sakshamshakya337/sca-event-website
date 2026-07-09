// /api/events/:id/complete
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function completeHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, action: 'complete' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
