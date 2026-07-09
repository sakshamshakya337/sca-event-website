// /api/events/approved
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function approvedEventsHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'approved' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
