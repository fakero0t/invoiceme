import { Router } from 'express';
import { register } from './register';
import { login } from './login';
import { logout } from './logout';
import { me } from './me';
import { refresh } from './refresh';
import { authMiddleware } from '../../shared/middleware/auth';

const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);

// Protected routes
authRouter.get('/me', authMiddleware, me);
authRouter.post('/logout', logout); // Can work with or without auth

export default authRouter;

