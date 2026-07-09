// /api/events/:id/registrations/count
import handler, { config as _config } from '../../index.js';
export { _config as config };

export default async function registrationsCountHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'registrations-count' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
