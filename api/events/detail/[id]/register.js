// /api/events/detail/:id/register
import handler, { config as _config } from '../../../index.js';
export { _config as config };

export default async function registerHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'register' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
