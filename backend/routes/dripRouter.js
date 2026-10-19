import express from 'express';
import accessTokenAutoRefresh from '../middlewares/accessTokenAutoRefresh.js';
import passport from 'passport';
import { isContentManager as isAdmin } from '../middlewares/isAdmin.js';
import {
    createDripRule,
    getAllDripRules,
    deleteDripRule,
    getDripForTarget,
    getDripTargetsByReferenceId,
    updateDripRuleByReferenceId,
} from '../controllers/dripController.js';

const router = express.Router();

// Create drip rule (admin only)
router.post(
    '/drip-rule',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    createDripRule
);

// Get all drip rules (admin only)
router.get(
    '/drip-rules',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    getAllDripRules
);

// Get drip targets by reference ID (admin only)
router.get(
    '/drip-rules/by-reference/:referenceId',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    getDripTargetsByReferenceId
);

// Update drip rule by target ID (admin only)
router.put(
    '/drip-rules/by-target/:targetID',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    updateDripRuleByReferenceId
);

// Delete drip rule (admin only)
router.delete(
    '/drip-rule/:id',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    deleteDripRule
);

// Get drip rules for a specific target type and ID (admin only)
router.get(
    '/drip-rules/:targetType/:targetId',
    accessTokenAutoRefresh,
    passport.authenticate('jwt', { session: false }),
    isAdmin,
    getDripForTarget
);

export default router;