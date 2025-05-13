import express from 'express';
import { UserRouter } from '../app/modules/user/user.route';
import { AuthRouter } from '../app/modules/auth/auth.route';
import { CommentRouter } from '../app/modules/comments/comments.router';
import { CommunityRouter } from '../app/modules/community/community.router';
import { ContactRoutes } from '../app/modules/contcatus/contactus.route';
import { CategoryRoutes } from '../app/modules/category/category.route';
import { SubCategoryRoutes } from '../app/modules/subCategorys/subCategory.route';
import { userManagementRouter } from '../app/modules/admin/userManagement/userManagement.route';
import { quotationManagementRouter } from '../app/modules/admin/quotationManagement/quotationManagement.route';
import { videoManagementRoute } from '../app/modules/admin/videosManagement/videoManagement.router';
import { PackageRoutes } from '../app/modules/package/package.routes';
import { SubscriptionRuleRoute } from '../app/modules/admin/subscriptionRule/subscriptionRule.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.routes';
import { ComingSoonRoutes } from '../app/modules/admin/comeingSoon/comeingSoon.router';
import { DashboardRoutes } from '../app/modules/admin/dashboard/dashboard.route';
import { FavouritdRouter } from '../app/modules/favourit/favourit.router';
import { CreatePostRoutes } from '../app/modules/admin/creaetPost/creaetPost.router';

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
  {
    path: '/admin/quotation/managment',
    route: quotationManagementRouter,
  },
  {
    path: '/admin/videos/managment',
    route: videoManagementRoute,
  },
  {
    path: '/admin/post/managment',
    route: CreatePostRoutes,
  },
  {
    path: '/post',
    route: CreatePostRoutes,
  },
  {
    path: '/videos',
    route: videoManagementRoute,
  },
  {
    path: '/admin/package/managment',
    route: PackageRoutes,
  },
  {
    path: '/package',
    route: PackageRoutes,
  },
  {
    path: '/admin/subscription/rules',
    route: SubscriptionRuleRoute,
  },
  {
    path: '/subscription',
    route: SubscriptionRuleRoute,
  },
  {
    path: '/admin/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/subscription',
    route: SubscriptionRoutes,
  },
  {
    path: '/admin/comingSoon',
    route: ComingSoonRoutes,
  },
  {
    path: '/admin/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/comingSoon',
    route: ComingSoonRoutes,
  },
  {
    path: '/favourit',
    route: FavouritdRouter,
  },
];

routes.forEach((element) => {
  if (element?.path && element?.route) {
    router.use(element?.path, element?.route);
  }
});

export default router;
