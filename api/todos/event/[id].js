// /api/todos/event/[id]
import handler from '../index.js';

export default async function todoEventHandler(req, res) {
  Object.defineProperty(req, 'query', {
    value: { ...req.query, eventId: req.query.id },
    writable: true,
    configurable: true
  });
  return handler(req, res);
}
