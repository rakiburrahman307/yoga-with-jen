import express from 'express';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { ChallengeController } from './challengesCategory.controller';
import fileUploadHandler from '../../../middleware/fileUploadHandler';
import parseFileData from '../../../middleware/parseFileData';
import { FOLDER_NAMES } from '../../../../enums/files';

const router = express.Router();

router.get('/get-all-challenge-category', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ChallengeController.getAllChallengeCategory);
router.get('/get-all-challenge-category-for-user', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), ChallengeController.getAllChallengeCategoryForUser);
router.post('/all-challenge-category-shuffle', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ChallengeController.shuffleCategorySerial);
router.get('/get-single-challenge-category/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ChallengeController.getSingleChallengeCategory);
router.put('/update-challenge-category-status/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ChallengeController.statusUpdate);
// Route to get all "Create Challenge" entries
router.patch('/update-challenge-category/:id', fileUploadHandler(), parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ChallengeController.updateChallengeCategory);
// Route to get all "Challenge Category" entries
router.delete('/delete-challenge-category/:id', auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ChallengeController.deleteChallengeCategory);
// Route to get a specific "Create Challenge" entry by ID
router.post('/create-challenge-category', fileUploadHandler(), parseFileData(FOLDER_NAMES.IMAGE), auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), ChallengeController.createChallengeCategory);

export const ChallengeCategoryRoutes = router;
