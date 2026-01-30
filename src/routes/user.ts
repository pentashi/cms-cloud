import type { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController.ts';
import { validate } from '../middleware/validateRequest.ts';
import { signupSchema, loginSchema } from '../validators/authValidator.ts';

const userController = new UserController();

export function setupUserRoutes(router: Router) {
  // Signup
  router.post('/signup', validate(signupSchema), async (req: Request, res: Response) => {
    try {
      const result = await userController.signup(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      const status = error.message.includes('already in use') ? 409 : 400;
      res.status(status).json({ error: error.message });
    }
  });

  // Login
  router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
    try {
      const result = await userController.login(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });
}
