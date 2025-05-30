import { Router } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
import { ContactController } from './contactus.controller';

const router = Router();

router.post('/create-contact', auth(USER_ROLES.USER), ContactController.createContact);
router.get('/', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getAllContacts);
router.get('/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ContactController.getsingleContact);

export const ContactRoutes = router;
