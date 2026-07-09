// /api/events/:id/registration-toggle
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function registrationToggleHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, action: 'registration-toggle' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
