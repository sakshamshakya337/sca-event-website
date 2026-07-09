// Vercel injects req.query.id from the URL path segment
// Delegate to the main verification handler which reads req.query.id
export { default, config } from '../index.js';
