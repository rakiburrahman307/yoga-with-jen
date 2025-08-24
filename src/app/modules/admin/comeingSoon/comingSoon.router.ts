import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { ComingSoonController } from './comingSoon.controller';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';

const router = express.Router();

// Route to create a new "Coming Soon" entry
router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), fileUploadHandlerbunny, ComingSoonController.createComingSoon);

// Route to get all "Coming Soon" entries
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComingSoonController.getAllComingSoon);
// Route to get the latest "Coming Soon" content (available to users)
router.get('/latest', auth(USER_ROLES.USER), ComingSoonController.getComingSoonContentLatest);
// Route to get the latest "Coming Soon" entry by ID (restricted to ADMIN and SUPER_ADMIN)
router.get('/latest/:id', auth(USER_ROLES.USER), ComingSoonController.singleComingSoonLatest);
// Route to get a specific "Coming Soon" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComingSoonController.singleComingSoon);

router.patch('/isReady/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComingSoonController.updateIsReady);
// Route to update an existing "Coming Soon" entry by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), fileUploadHandlerbunny, ComingSoonController.updateComingSoon);

// Route to delete a "Coming Soon" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComingSoonController.deleteComingSoon);

export const ComingSoonRoutes = router;
