// /api/verification/:id/reject
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function rejectVerificationHandler(req, res) {
  req.query.action = 'reject';
  return handler(req, res);
}
