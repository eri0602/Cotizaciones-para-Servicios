import { Router } from 'express';
import { proposalController } from '../controllers/proposalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', proposalController.create.bind(proposalController));
router.get('/my-proposals', proposalController.getMyProposals.bind(proposalController));
router.get('/request/:requestId', proposalController.getForRequest.bind(proposalController));
router.put('/:id', proposalController.update.bind(proposalController));
router.delete('/:id', proposalController.withdraw.bind(proposalController));
router.post('/:id/accept', proposalController.accept.bind(proposalController));
router.post('/:id/reject', proposalController.reject.bind(proposalController));

export default router;
