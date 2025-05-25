import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middleware/validateRequest';
import fileUploadHandlerbunny from '../../../middleware/fileUploadHandlerbunny';
import { ChallengeController } from './challanges.controller';
import { CreateDailyInspiration } from './challanges.validation';

const router = express.Router();

// Route to create a new "Create Challenge" entry
router.post('/create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, validateRequest(CreateDailyInspiration.createDailyInspiration), ChallengeController.createChallenge);

// Route to get all "Create Challenge" entries
router.get('/letest', auth(USER_ROLES.USER), ChallengeController.getAllCreateChallenge);
router.get('/single/:id', auth(USER_ROLES.USER), ChallengeController.singleChallenge);
// Route to get all "Create Challenge" entries
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.getAllCreateChallenge);

// Route to get a specific "Create Challenge" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.singleChallenge);

// Route to update an existing "Create Challenge" entry by ID
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), fileUploadHandlerbunny, ChallengeController.updateChallenge);

// Route to delete a "Create Challenge" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.deleteChallenge);

export const ChallengeRoutes = router;
