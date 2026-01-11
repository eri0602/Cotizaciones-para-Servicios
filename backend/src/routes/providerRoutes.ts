import { Router } from 'express';
import { providerController } from '../controllers/providerController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/search', providerController.search.bind(providerController));
router.get('/:id', providerController.getProfile.bind(providerController));
router.use(authenticate);

router.post('/profile', providerController.createProfile.bind(providerController));
router.put('/profile', providerController.updateProfile.bind(providerController));
router.post('/portfolio', providerController.addPortfolioItem.bind(providerController));
router.delete('/portfolio/:id', providerController.deletePortfolioItem.bind(providerController));
router.post('/certifications', providerController.addCertification.bind(providerController));

export default router;
