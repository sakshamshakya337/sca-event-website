// /api/events/detail/:id
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function detailHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'detail' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
