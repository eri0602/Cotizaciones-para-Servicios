import { Router } from 'express';
import { requestController } from '../controllers/requestController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', requestController.create.bind(requestController));
router.get('/', requestController.getAll.bind(requestController));
router.get('/my-requests', requestController.getMyRequests.bind(requestController));
router.get('/:id', requestController.getById.bind(requestController));
router.put('/:id', requestController.update.bind(requestController));
router.delete('/:id', requestController.delete.bind(requestController));

export default router;
