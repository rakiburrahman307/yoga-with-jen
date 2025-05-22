import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { ComeingSoonController } from './comeingSoon.controller';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';

const router = express.Router();

// Route to create a new "Coming Soon" entry
router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), fileUploadHandlerbunny, ComeingSoonController.createComingSoon);

// Route to get all "Coming Soon" entries
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComeingSoonController.getAllComingSoon);
// Route to get the latest "Coming Soon" content (available to users)
router.get('/latest', auth(USER_ROLES.USER), ComeingSoonController.getComingSoonContentLetest);
// Route to get the latest "Coming Soon" entry by ID (restricted to ADMIN and SUPER_ADMIN)
router.get('/latest/:id', auth(USER_ROLES.USER), ComeingSoonController.singleComingSoonLetest);
// Route to get a specific "Coming Soon" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComeingSoonController.singleComingSoon);

// Route to update an existing "Coming Soon" entry by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), fileUploadHandlerbunny, ComeingSoonController.updateComingSoon);

// Route to delete a "Coming Soon" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPER_ADMIN), ComeingSoonController.deleteComingSoon);

export const ComingSoonRoutes = router;
