import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { ChallengeController } from './challenges.controller';


const router = express.Router();


router.post('/schedule-create', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.createChallengeForSchedule);
// Route to get all "Create Challenge" entries
router.get('/latest', auth(USER_ROLES.USER), ChallengeController.getChallenges);
router.get('/single/:id', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), ChallengeController.singleChallenge);
// Route to get all "Create Challenge" entries
router.get('/get-challenges-videos/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.getAllCreateChallenge);
router.get('/get-challenges-videos-for-users/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER), ChallengeController.getChallenge);
router.post('/mark-video-watched/:videoId', auth(USER_ROLES.USER), ChallengeController.markVideoAsCompleted);
// Route to get a specific "Create Challenge" entry by ID
router.get('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.singleChallenge);
router.patch('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.updateChallenge);
// Route to delete a "Create Challenge" entry by ID
router.delete('/:id', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.deleteChallenge);
router.post('/shuffle', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.shuffleVideoSerial);
export const ChallengeRoutes = router;
