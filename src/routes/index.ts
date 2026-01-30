import type { Router } from 'express';
import { setupPostsRoutes } from './posts.ts';
import { setupUserRoutes } from './user.ts';

export function setupRoutes(router: Router) {
  setupUserRoutes(router);
  setupPostsRoutes(router);
}
