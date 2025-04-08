import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { CommentRouter } from '../app/modules/comments/comments.router';
import { CommunityRouter } from '../app/modules/community/community.router';
import { ContactRoutes } from '../app/modules/contcatus/contactus.route';

const router = express.Router();
const routes = [
  {
    path: '/auth',
    route: AuthRouter,
  },
  {
    path: '/users',
    route: UserRouter,
  },
  {
    path: '/community',
    route: CommunityRouter,
  },
  {
    path: '/comments',
    route: CommentRouter,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path: '/admin/contact',
    route: ContactRoutes,
  },
];

routes.forEach((element) => {
  if (element?.path && element?.route) {
    router.use(element?.path, element?.route);
  }
});

export default router;
