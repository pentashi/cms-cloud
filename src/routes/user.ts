import type { Router, Request, Response } from 'express';
import { UserController } from '../controllers/userController.ts';
import { validate } from '../middleware/validateRequest.ts';
import { asyncHandler } from '../middleware/errorHandler.ts';
import { signupSchema, loginSchema } from '../validators/authValidator.ts';

const userController = new UserController();

export function setupUserRoutes(router: Router) {
  // Signup
  router.post('/signup', validate(signupSchema), asyncHandler(async (req: Request, res: Response) => {
    const result = await userController.signup(req.body);
    res.status(201).json(result);
  }));

  // Login
  router.post('/login', validate(loginSchema), asyncHandler(async (req: Request, res: Response) => {
    const result = await userController.login(req.body);
    res.status(200).json(result);
  }));
}
