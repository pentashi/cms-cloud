import type { Router } from 'express';
import { setupPostsRoutes } from './posts.ts';

export function setupRoutes(router: Router) {
  setupPostsRoutes(router);
}
