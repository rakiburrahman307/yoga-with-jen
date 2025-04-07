import express from "express";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
import auth from "../../middleware/auth";
const router = express.Router();

router.get("/", 
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), 
    SubscriptionController.subscriptions
);

router.get("/details", 
    auth(USER_ROLES.USER), 
    SubscriptionController.subscriptionDetails
);

router.get("/:id", 
    auth(USER_ROLES.USER), 
    SubscriptionController.companySubscriptionDetails
)

export const SubscriptionRoutes = router;