import type { SignupInput, LoginInput } from '../validators/authValidator.ts';
import { UserService } from '../services/userService.ts';

const userService = new UserService();

export class UserController {
  async signup(data: SignupInput) {
    return await userService.signup(data);
  }

  async login(data: LoginInput) {
    return await userService.login(data);
  }
}
