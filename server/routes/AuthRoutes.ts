import express from 'express';
import { LoginUser, logoutUser, registerUser, verifyUser } from '../controllers/AuthControllers.js';
import protect from '../middlewares/auth.js';

const AuthRouter = express.Router();

console.log("Auth routes loaded");

AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', LoginUser);
AuthRouter.post('/logout',protect, logoutUser);
AuthRouter.get('/verify',protect, verifyUser);

export default AuthRouter;