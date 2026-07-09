// /api/events/:id/registrations
import handler, { config as _config } from '../../index.js';
export { _config as config };

export default async function registrationsHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'registrations' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
