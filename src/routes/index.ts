import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { CommentRouter } from '../app/modules/comments/comments.router';
import { CommunityRouter } from '../app/modules/community/community.router';
import { ContactRoutes } from '../app/modules/contcatus/contactus.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { SubCategoryRoutes } from '../app/modules/subCategorys/subCategory.route';
import { userManagementRouter } from '../app/modules/admin/userManagement/userManagement.route';

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
  {
    path: '/admin/category',
    route: CategoryRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/admin/subcategory',
    route: SubCategoryRoutes,
  },
  {
    path: '/subcategory',
    route: SubCategoryRoutes,
  },
  {
    path: '/admin/user/managment',
    route: userManagementRouter,
  },
];

routes.forEach((element) => {
  if (element?.path && element?.route) {
    router.use(element?.path, element?.route);
  }
});

export default router;
