// /api/users/me/profile
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function profileHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'profile' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
