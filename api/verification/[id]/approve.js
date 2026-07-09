// /api/verification/:id/approve
import handler, { config as _config } from '../index.js';
export { _config as config };

export default async function approveVerificationHandler(req, res) {
  req.query.action = 'approve';
  return handler(req, res);
}
