// /api/events/all-public
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function allPublicEventsHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'all-public' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
