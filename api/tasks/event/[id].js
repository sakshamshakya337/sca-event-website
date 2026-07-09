// /api/tasks/event/[id]
import handler from '../index.js';

export default async function taskEventHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, eventId: req.query.id },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
