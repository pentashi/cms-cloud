import type { Router } from 'express';
import { setupPostsRoutes } from './posts.js';
import { setupUserRoutes } from './user.js';

export function setupRoutes(router: Router) {
  setupUserRoutes(router);
  setupPostsRoutes(router);
}
