import type { Router, Request, Response } from 'express';
import { PostController } from '../controllers/postController.ts';
import { validate } from '../middleware/validateRequest.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { createPostSchema, updatePostSchema } from '../validators/postValidator.ts';

const postController = new PostController();

export function setupPostsRoutes(router: Router) {
  // Fetch all posts
  router.get('/posts', async (req: Request, res: Response) => {
    try {
      const posts = await postController.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts', details: error });
    }
  });

  // Fetch single post by ID
  router.get('/posts/:id', async (req: Request, res: Response) => {
    try {
      const post = await postController.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch post', details: error });
    }
  });

  // Create new post (requires authentication)
  router.post('/posts', authenticate, validate(createPostSchema), async (req: Request, res: Response) => {
    try {
      const post = await postController.createPost(req.body);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create post', details: error });
    }
  });

  // Update post (requires authentication)
  router.put('/posts/:id', authenticate, validate(updatePostSchema), async (req: Request, res: Response) => {
    try {
      const post = await postController.updatePost(req.params.id, req.body);
      res.json(post);
    } catch (error: any) {
      const status = error.message === 'Post not found' ? 404 : 400;
      res.status(status).json({ error: error.message, details: error });
    }
  });

  // Delete post (requires authentication)
  router.delete('/posts/:id', authenticate, async (req: Request, res: Response) => {
    try {
      await postController.deletePost(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      const status = error.message === 'Post not found' ? 404 : 500;
      res.status(status).json({ error: error.message, details: error });
    }
  });
}
