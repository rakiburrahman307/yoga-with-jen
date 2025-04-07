import express from 'express';
import { ChatController } from './chat.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
const router = express.Router();

router.post(
  '/:id',
  auth(USER_ROLES.USER),
  ChatController.createChat
);
router.get(
  '/',
  auth(USER_ROLES.USER),
  ChatController.getChat
);

export const ChatRoutes = router;
