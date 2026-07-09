// /api/tasks/my
import handler from './index.js';

export default async function myTasksHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, type: 'my' },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
