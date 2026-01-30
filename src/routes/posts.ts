import type { Router, Request, Response, NextFunction } from 'express';
import { PostController } from '../controllers/postController.ts';
import { validate } from '../middleware/validateRequest.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';
import { createPostSchema, updatePostSchema } from '../validators/postValidator.ts';

const postController = new PostController();

export function setupPostsRoutes(router: Router) {
  // Fetch all posts
  router.get('/posts', asyncHandler(async (req: Request, res: Response) => {
    const posts = await postController.getAllPosts();
    res.json(posts);
  }));

  // Fetch single post by ID
  router.get('/posts/:id', asyncHandler(async (req: Request, res: Response) => {
    const post = await postController.getPostById(req.params.id as string);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  }));

  // Create new post (requires authentication)
  router.post('/posts', authenticate, validate(createPostSchema), asyncHandler(async (req: Request, res: Response) => {
    const post = await postController.createPost(req.body);
    res.status(201).json(post);
  }));

  // Update post (requires authentication)
  router.put('/posts/:id', authenticate, validate(updatePostSchema), asyncHandler(async (req: Request, res: Response) => {
    const post = await postController.updatePost(req.params.id as string, req.body);
    res.json(post);
  }));

  // Delete post (requires authentication)
  router.delete('/posts/:id', authenticate, asyncHandler(async (req: Request, res: Response) => {
    await postController.deletePost(req.params.id as string);
    res.status(204).send();
  }));
}
